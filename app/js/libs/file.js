function OpenFile(filename) {
    return new Promise(function(resolve, reject) {
        fs.readFile(filename, {encoding: 'utf-8'}, function (err, data) {
            if (err) reject(err);
            resolve(data);
        })
    });
}

function SaveFile(filename, data) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(filename, data, function (err) {
            if (err) reject(err);
            resolve(filename);
        })
    });
}