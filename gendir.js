const fs = require('fs');
const dirTree = require("directory-tree");

const toHTMLBetter = (dir, paths) => {
  return `
<html>
  <head><title>Index of ${dir}</title><link rel="stylesheet" href="/style.css"></head>
  <body><h1>Index of ${dir}</h1>
  <ul>
${paths.map((path) => {
    console.log(path)
    const name = path.type === 'directory' ? `${path.name}/` : `${path.name}`;
    const filePath = path.type === 'directory' ? `./${path.name}` : `/${dir}/${path.name}`;

    return `<li><a href="${filePath}" ${path.type == 'file' ? 'target="_blank" ' : ''}title="${path.name}">${name}</a></li>`
  }).join('\n')}</ul>
  </body>
</html>`
    .trim();
}

const getArrayOfAllDirs = (parent) => {
  let all = [parent];

  //console.log(parent.type)
  if (parent.type !== 'directory') return [];

  //adding children
  for (let i = 0; i < parent.children.length; i++) {
    all.push(...getArrayOfAllDirs(parent.children[i]));
  }

  return all.map(n => {
    return {
      ...n,
      path: n.path.replaceAll('\\', '/')
    }
  });
}

//getting rid of old dir directory if it exists
fs.existsSync('./dir') && fs.rmSync('./dir', { recursive: true });

const tree = dirTree("./", {
  exclude: /csv|zips|node_modules|\.env|\.git|package-lock\.json|\.env|index\.html/,
  attributes: ['size', 'type', 'mtime']
});

//making new dir directory
fs.mkdirSync('./dir');

//children
getArrayOfAllDirs(tree).forEach((dir, i) => {
  if (dir.path === './data') return;

  const res = toHTMLBetter(dir.path, dir.children);
  //const replacedPath = `./dir/${dir.path.replace('data/', '')}`;
  const replacedPath = `./dir/${dir.path}`;

  //adding path if it doesnt exist
  if (!fs.existsSync(replacedPath)) fs.mkdirSync(replacedPath, { recursive: true })

  fs.writeFileSync(`${replacedPath}/index.html`, res);
});