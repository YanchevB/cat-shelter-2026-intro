import http from 'http';

const server = http.createServer((req, res) => {
    res.write('Hello World!');

    res.end();
});

server.listen(3000, () => {
    console.log('Server is listening on http://localhost:3000...');
});