let JSONbinDB = (function (){
	function JSONbinDB(key){
		this.key = key;
		console.log(this.key);
		}
	JSONbinDB.prototype = {
		key: {},
		create: async function(settings = {}, callback = (res)=>{console.log(res)}){
			let defaults = {name: "no name", private: true, collectionId: ""};
			settings = Object.assign({}, defaults, settings);
			let req = new XMLHttpRequest();
			req.onreadystatechange = () => {
				if (req.readyState == XMLHttpRequest.DONE) {
					let res = JSON.parse(req.responseText);
					callback (res.metadata);
					}
				};
			req.open("POST", "https://api.jsonbin.io/v3/b", true);
			req.setRequestHeader("Content-Type", "application/json");
			req.setRequestHeader("X-Master-Key", this.key.master);
			req.setRequestHeader("X-Access-Key", this.key.create);
			req.setRequestHeader("X-Bin-Private", settings.private);
			req.setRequestHeader("X-Bin-Name", settings.name);
			req.setRequestHeader("X-Collection-Id", settings.collectionId);
			req.send(JSON.stringify({fields: []}));
			console.log(settings);
			},
		select: function (settings, callback = (res)=>{console.log(res)}){
			let defaults = {meta: false, where: "$.fields[*]", tableId: ""};
			settings = Object.assign({}, defaults, settings);
			let req = new XMLHttpRequest();
			req.onreadystatechange = () => {
				if (req.readyState == XMLHttpRequest.DONE) {
					let res = JSON.parse(req.responseText);
					callback(res);
					}
				};
			req.open("GET", `https://api.jsonbin.io/v3/b/${settings.tableId}/latest`, true);
			req.setRequestHeader("X-Master-Key", this.key.master);
			req.setRequestHeader("X-Access-Key", this.key.read);
			req.setRequestHeader("X-Bin-Meta", settings.meta);
			req.setRequestHeader("X-JSON-Path", settings.where);
			req.send();
			},
		insert: function (settings, callback = (res)=>{console.log(res)}){
			let defaults = {field: {}, tableId: ""};
			settings = Object.assign({}, defaults, settings);
			this.select({tableId: settings.tableId}, (res)=>{
				res.push(settings.field);
				let req = new XMLHttpRequest();
				req.onreadystatechange = () => {
					if (req.readyState == XMLHttpRequest.DONE) {
						let res = JSON.parse(req.responseText);
						callback(res.record.fields);
						}
					};
				req.open("PUT", `https://api.jsonbin.io/v3/b/${settings.tableId}`, true);
				req.setRequestHeader("Content-Type", "application/json");
				req.setRequestHeader("X-Master-Key", this.key.master);
				req.setRequestHeader("X-Access-Key", this.key.update);
				req.send(JSON.stringify({fields: res}));
				});
			
			},
		update: function (settings, callback = (res)=>{console.log(res)}){
			let defaults = {where: "$.fields[*]", field: {}, tableId: ""};
			settings = Object.assign({}, defaults, settings);
			this.select({tableId: settings.tableId}, (res1)=>{
				this.select({tableId: settings.tableId, where: settings.where}, (res2)=>{
					for(let i=0;i<res1.length;i++){
						for(let j=0;j<res2.length;j++){
							if(JSON.stringify(res1[i]) == JSON.stringify(res2[j])){
								res1[i] = Object.assign({}, res1[i], settings.field);
								break;
								}
							}
						}
					let req = new XMLHttpRequest();
					req.onreadystatechange = () => {
						if (req.readyState == XMLHttpRequest.DONE) {
							let res = JSON.parse(req.responseText);
							callback(res.record.fields);
							}
						};
					req.open("PUT", `https://api.jsonbin.io/v3/b/${settings.tableId}`, true);
					req.setRequestHeader("Content-Type", "application/json");
					req.setRequestHeader("X-Master-Key", this.key.master);
					req.setRequestHeader("X-Access-Key", this.key.update);
					req.send(JSON.stringify({fields: res1}));
					});
				});
			
			},
		delete: function (settings, callback = (res)=>{console.log(res)}){
			let defaults = {where: "$.fields[*]", tableId: ""};
			settings = Object.assign({}, defaults, settings);
			this.select({tableId: settings.tableId}, (res1)=>{
				this.select({tableId: settings.tableId, where: settings.where}, (res2)=>{
					let fields = [];
					for(let i=0;i<res1.length;i++){
						fields.push(res1[i]);
						for(let j=0;j<res2.length;j++){
							if(JSON.stringify(res1[i]) == JSON.stringify(res2[j])){
								fields.pop();
								break;
								}
							}
						}
					let req = new XMLHttpRequest();
					req.onreadystatechange = () => {
						if (req.readyState == XMLHttpRequest.DONE) {
							let res = JSON.parse(req.responseText);
							callback(res.record.fields);
							}
						};
					req.open("PUT", `https://api.jsonbin.io/v3/b/${settings.tableId}`, true);
					req.setRequestHeader("Content-Type", "application/json");
					req.setRequestHeader("X-Master-Key", this.key.master);
					req.setRequestHeader("X-Access-Key", this.key.update);
					req.send(JSON.stringify({fields: fields}));
					});
				});
			
			}
		
		}
	return JSONbinDB;
	})();