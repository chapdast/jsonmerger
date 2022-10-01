const fs = require('fs');

const path = require('path');

const pwd = path.resolve(__dirname, 'src/assets/i18n');

function read() {
    const languages = fs.readdirSync(pwd);
    languages.forEach((language) => {// languages
        fs.stat(pwd + '/' + language, (err, stat) => {
            if (stat.isDirectory()) {
                const file_name = `${language}.json`;
                const fileData = {};
                const langdir = pwd + '/' + language;
                const sections = fs.readdirSync(langdir);
                sections.forEach((spl) => {
                    const p = langdir + '/' + spl;
                    const splitName = spl.split('.')[0];
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
    });
};



read();
