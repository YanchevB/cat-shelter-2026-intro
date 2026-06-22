import http from 'http';
import fs from 'fs/promises';

const server = http.createServer(async (req, res) => {
    if (req.url === '/styles/site.css') {
        const cssContent = await fs.readFile('./styles/site.css', 'utf-8');

        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.write(cssContent);
        
        return res.end();
    }

    const homePage = await fs.readFile('./views/home/index.html', 'utf-8');

    res.writeHead(200, { 'Content-Type': 'text/html'});
    res.write(homePage);

    res.end();
});

server.listen(3000, () => {
    console.log('Server is listening on http://localhost:3000...');
});