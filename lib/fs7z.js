'use strict';

/**
 * Create an object somewhat similar to built0in fs object, but storing files into an (encrypted) archive.
 * @promise List
 * @param archive {string} Path to the archive.
 * @param options {Object} An object of acceptable options to 7za bin. FOr instance: { p: "mysecret", mhe: "+" }
 * @resolve {Object} Tech spec about the archive.
 * @reject {Error} The error as issued by 7-Zip.
 */
module.exports = function (n7z, archive, archive_options) {
    function archive_fs(archive, archive_options) {
        this.archive = archive;
        this.archive_options = archive_options;
    }

    archive_fs.prototype.readFile = function (path, options, callback) {
        return n7z.extractOne(this.archive, path, this.archive_options)
        .then(data => callback(null, data))
        .catch(err => callback(err));
    };

    archive_fs.prototype.writeFile = function (path, data, options, callback) {
        return n7z.addOne(this.archive, path, data, this.archive_options)
        .then(data => callback(null, data))
        .catch(err => callback(err));
    };

    archive_fs.prototype.readdir = function (path, options, callback) {
        return n7z.list(this.archive, path, this.archive_options)
        .then(data => callback(null, data))
        .catch(err => callback(err));
    };

    return new archive_fs(archive, archive_options);
};

if (!module.parent) {
    // run tests
    var n7z_ctor = require("./index");
    var n7z = new n7z_ctor();

    var fs7z_create = module.exports;
    var fs7z = fs7z_create(n7z, "fs7z_test.7z", { p: "mysecret", /* mhe: "+" */ });

    Promise.resolve()
    .then(() => { return fs7z.writeFile("a.txt", "patati patata", {}, cb); })
    .then(() => { return fs7z.writeFile("b.txt", "tralali làlà", {}, cb); })
    .then(() => { return fs7z.writeFile("d\\f.txt", "on envoie tout là ありがとう. ", {}, cb); })
    .then(() => { return fs7z.readdir("", {}, cb); })
    .then(() => { return fs7z.readFile("a.txt", {}, cb); })
    .then(() => { return fs7z.readFile("b.txt", {}, cb); })
    .then(() => { return fs7z.readFile("d\\f.txt", {}, cb); });

    function cb(err, data) {
        console.log("error: ", err, "\n", "data", data, "\n\n---\n");
    }
}