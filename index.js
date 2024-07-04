"use strict";
const fs = require("fs");
const pg = require("pg");
const path = require("path");
const axios = require('axios');


const caCertPath = path.resolve("/Users/murat/.postgresql/root.crt");

const caCert = fs.readFileSync(caCertPath).toString();

const config = {
    connectionString:
        "postgres://candidate:62I8anq3cFq5GYh2u4Lh@rc1b-r21uoagjy1t7k77h.mdb.yandexcloud.net:6432/db1",
    ssl: {
        rejectUnauthorized: true,
        ca: caCert
    },
};

const conn = new pg.Client(config);

async function getTotalPages() {
    try {
        const response  = await axios.get('https://rickandmortyapi.com/api/character');
        const totalPages = response.data.info.pages;
        console.log('totalPages = ', totalPages);
        return totalPages
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
const delete_table = `DROP TABLE murat_nurmatov`;

const createTable = `CREATE TABLE murat_nurmatov (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    data JSONB
);`
conn.query(delete_table, (err, q) => {
    if (err) throw err;
    console.log(q.rows[0]);
});
conn.query(createTable, (err, q) => {
    if (err) throw err;
    console.log(q.rows[0]);
});

conn.connect((err) => {
    if (err) throw err;
    async function addDataToTable(data) {
        try {
            for (let character of data.results) {
                const { id, name, ...rest } = character;
                const jsonData = JSON.stringify(rest);
                const insertQuery = `
                    INSERT INTO murat_nurmatov (id, name, data)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (id) DO NOTHING;`;

                await conn.query(insertQuery, [id, name, jsonData]);
            }
            console.log("Данные успешно добавлены в таблицу.");
        } catch (error) {
            console.error("Ошибка при добавлении данных:", error);
        } finally {
        }
    }

    async function loadDataFromAPI() {
        try {
            const pages = await getTotalPages();
            for (let i = 1; i <= pages; i++){
                const response = await axios.get(`https://rickandmortyapi.com/api/character/?page=${i}`);
                const data = response.data;
                console.log('id = ', data.results.id);
                await addDataToTable(data);
            }
            conn.end();
        } catch (error) {
            console.error("Ошибка при загрузке данных с API:", error);
        }
    }
    loadDataFromAPI();
});




