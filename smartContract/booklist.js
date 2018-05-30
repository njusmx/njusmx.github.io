"use strict";

var BookItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.description = obj.description;
		this.writer = obj.writer;
		this.rate = obj.rate;
        this.linkAddress = obj.linkAddress;
		this.author = obj.author;
	} else {
	    this.key = "";
	    this.writer = "";
        this.linkAddress = "";
	    this.description = "";
	    this.rate = "";
	    this.author = "";    
	}
};

BookItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var BookList = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new BookItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

BookList.prototype = {
    init: function () {
        // todo
    },

    save: function (key, writer, rate, linkAddress, description) {

        key = key.trim();
        writer = writer.trim();
        if (key === "" || writer === ""){
            throw new Error("empty BookName / Author");
        }
        if (writer.length > 64 || key.length > 64){
            throw new Error("BookName / Author exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var bookItem = this.repo.get(key);
        if (bookItem){
            throw new Error("The book already exists in the booklist");
        }

        bookItem = new BookItem();
        bookItem.author = from;
        bookItem.key = key;
        bookItem.description = description;
        bookItem.writer = writer;
        bookItem.rate = rate;
        bookItem.linkAddress = linkAddress;

        this.repo.put(key, bookItem);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = BookList;