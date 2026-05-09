const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const reactCompRegex = /const ([A-Z][a-zA-Z0-9_]+)\s*=\s*(function|\([^)]*\)\s*=>)/g;
let match;
let components = [];
while ((match = reactCompRegex.exec(content)) !== null) {
    components.push(match[1]);
}
console.log(components.join(', '));
