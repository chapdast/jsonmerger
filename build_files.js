const fs = require('fs');

const path = require('path');

const pwd = path.resolve(__dirname, 'src/assets/i18n');
const outputDir = path.resolve(__dirname, 'src/assets/i18n')
const rootDir = path.resolve(__dirname, 'src/assets/i18n/translates');


function fileAbsolutePath(path) {
    let list = [];
    const files = fs.readdirSync(path);
    files.forEach((file) => {
        //check to see if is a directory so read recursive;
        const fp = `${path}/${file}`;
        if (fs.statSync(fp).isDirectory()) {
            const subFiles = fileAbsolutePath(fp)
            if (subFiles.length) {
                list = list.concat(subFiles);
            }
        } else {
            list.push(fp);
        }
    })
    list = list.filter((path) => hasJsonExtension(path))
    return list;
}

function hasJsonExtension(file) {
    return file.slice(-5) === '.json'
}

function getLangOf(file) {
    if (hasJsonExtension(file)) {
        return file.slice(-7, -5)
    } else {
        return "_"
    }
}
function getFileName(file) {
    const section = file.split('/');
    const name = section.length ? section[section.length - 1] : section[0];
    return name.slice(0, -8)
}
function readFileData(dir) {
    let files = {} // {'lang': {'service_name': {values}},}
    const path = fileAbsolutePath(dir)
    console.log(path);
    path.forEach((file) => {
        const lang = getLangOf(file);
        const filename = getFileName(file);
        if (!(lang in files)) {
            files[lang] = {};
        }
        const data = JSON.parse(fs.readFileSync(file, 'utf8'))
        Object.keys(data).forEach(key => files[lang][key] = data[key]);
    })
    return files;
}
function writeFile(data) {
    Object.keys(data).forEach((lang) => {
        fs.writeFileSync(outputDir + '/' + lang + '/' + 'protos.json',
            JSON.stringify(data[lang], null, '\t'), (err) => {
                if (err) {
                    return console.log('err', err);
                }
            });

    })
}
function buildProtoTranslations() {
    return new Promise((r) => {
        writeFile(readFileData(rootDir))
        r();
    })
}


function mergeFiles() {
    buildProtoTranslations().then(() => {
        const languages = fs.readdirSync(pwd);
        languages.forEach((language) => {// languages
            // match any xx or xx_XX formats
            if (language !== 'translates') {
                fs.stat(pwd + '/' + language, (err, stat) => {
                    if (stat.isDirectory()) {
                        const file_name = `${language}.json`;
                        const fileData = {};
                        const langdir = pwd + '/' + language;
                        const sections = fs.readdirSync(langdir);
                        sections.forEach((spl) => {
                            const p = langdir + '/' + spl;
                            const splitName = spl.split('.')[0];
                            console.log(p)
                            const data = fs.readFileSync(p, 'utf8');
                            if (splitName === `_${language}`) {
                                const d = JSON.parse(data);
                                Object.keys(d).forEach((key) => {
                                    fileData[key] = d[key];
                                });
                            } else {
                                fileData[splitName] = JSON.parse(data);
                            }
                        });
                        const status = fs.writeFileSync(pwd + '/' + file_name, JSON.stringify(fileData, null, '\t'), (err) => {
                            if (err) {
                                return console.log('err', err);
                            }
                        });
                    }
                })
            }
        });
    });
};


mergeFiles();
