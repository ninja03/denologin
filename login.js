import {
    createApp,
    serveStatic
} from "https://servestjs.org/@v1.1.9/mod.ts";

import { v4 } from "https://deno.land/std@0.79.0/uuid/mod.ts";

const users = [];

const app = createApp();
app.use(serveStatic("./public"));

app.get("/", async (req) => {
    req.redirect("/index.html");
});

app.post("/regist", async (req) => {
    const bodyForm = await req.formData();
    const id = bodyForm.value("id");
    const pass = bodyForm.value("pass");
    for (let u of users) {
        if (u.id === id) {
            await req.respond({
                status: 200,
                body: "すでに登録されています"
            });
            return;
        }
    }
    const key = v4.generate();
    users.push({id: id, pass: pass, key: key});
    req.setCookie("key", key, {
        path: "/",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 30,
    });
    await req.respond({
        status: 200,
        body: id + "さん登録ありがとうございます"
    });
    return;
});

app.post("/login", async (req) => {
    const bodyForm = await req.formData();
    const id = bodyForm.value("id");
    const pass = bodyForm.value("pass");
    for (let u of users) {
        if (u.id === id && u.pass === pass) {
            req.setCookie("key", u.key, {
                path: "/",
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 30,
            });
            await req.respond({
                status: 200,
                body: u.id + "さんでログインしました"
            });
            return;
        }
    }
    await req.respond({
        status: 200,
        body: "ログインできませんでした"
    });
});

app.get("/status", async (req) => {
    const key = req.cookies.get("key");
    for (let u of users) {
        if (u.key === key) {
            await req.respond({
                status: 200,
                body: u.id + "さんでログインしています"
            });
        }
        return;
    }
    await req.respond({
        status: 200,
        body: "ログインしていません"
    });
});
app.get("/logout", async (req) => {
    req.cookies.delete("key");
    await req.respond({
        status: 200,
        body: "ログアウトしました"
    });
});
app.listen({ port: 8880 });

