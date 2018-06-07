var fileManager = require('fs');
var gettype=Object.prototype.toString;
String.prototype.firstUpperCase = function(){
    return this.replace(/\b(\w)(\w*)/g, function($0, $1, $2) {
        return $1.toUpperCase() + $2.toLowerCase();
    });
}
var arguments = process.argv.splice(2);
var path =  arguments[0];
path = "/Users/jaki/Desktop/tictalk-main%20copy.postman_collection.json"
if (!path) {
	console.log("请传入要转换的JSON文件路径");
	return;
}
console.log('json文件路径:', path);
try{
	var result = JSON.parse(fileManager.readFileSync(path));
}catch(error){
	console.log("解析JSON文件失败:"+error);
	return;
}
if (!result) {
	console.log("解析JSON文件无效");
	return;
}
var classArray = new Array();
parseObject("MyObject",result);

var stringAll="";
for (var i = classArray.length-1; i >=0 ; i--) {
	let cla = classArray[i];
	stringAll+="@protocol "+cla.name+" @end\r\n\r\n@interface "+cla.name+" : JSONModel\r\n\r\n";
	console.log("@protocol "+cla.name+" @end\r\n\r\n@interface "+cla.name+" : JSONModel\r\n\r\n");
	for (var j = 0; j < cla.property.length; j++) {
		stringAll+=cla.property[j]+"\r\n\r\n";
		console.log(cla.property[j]+"\r\n\r\n");
	}
	stringAll+="@end\r\n\r\n";
	console.log("@end\r\n\r\n");
}
stringAll+="===========m文件======================\r\n";
console.log("===========m文件======================\r\n");
for (var i = classArray.length-1; i >=0 ; i--) {
	let cla = classArray[i];
	stringAll+="@implementation "+cla.name+"\r\n\r\n@end\r\n\r\n";
	console.log("@implementation "+cla.name+"\r\n\r\n@end\r\n\r\n");
}
let paths = path.split("/");
paths.pop();
let newPath = paths.join("/")+"/oc.txt";
fileManager.writeFileSync(newPath,stringAll);

function parseObject(k,result){
	let c = new Class(k);
	classArray.push(c);
	for (var i = 0; i < Object.getOwnPropertyNames(result).length; i++) {
		let key = Object.getOwnPropertyNames(result)[i];
		let value = result[key];
		let type = getType(value);
		if(type==null){
			continue;
		}
		if (type=="Object") {
			//进行二次解析
			if (Object.getOwnPropertyNames(value).length==0) {
				c.property.push("@property(nonatomic,strong)NSDictionary<Optional>*"+key+";");
			}else{
				parseObject(key.firstUpperCase(),value);
				c.property.push("@property(nonatomic,strong)"+key.firstUpperCase()+"<Optional,"+key.firstUpperCase()+">*"+key+";");
			}
			continue;
		}
		if (type=="Array") {
			if (value.length>0) {
				let obj = value[0];
				let t = getType(obj);
				if (t==null) {
					continue;
				}
				if (t=="Object") {
					c.property.push("@property(nonatomic,strong)NSArray<"+key.firstUpperCase()+"*><Optional,"+key.firstUpperCase()+">*"+key+";");
					parseObject(key.firstUpperCase(),obj);
				}else{
					c.property.push("@property(nonatomic,strong)NSArray<"+t+"*><Optional>*"+key+";");
				}
			}else{
				c.property.push("@property(nonatomic,strong)NSArray<Optional>*"+key+";");
			}
			continue;
		}
		if (type=="id") {
			c.property.push("@property(nonatomic,strong)"+type+"<Optional>"+key+";");
			continue;
		}
		c.property.push("@property(nonatomic,strong)"+type+"<Optional>*"+key+";");
	}
}



function getType(obj){
	if (typeof obj == 'number') {
		return "NSNumber";
	}
	if (typeof obj == 'undefined') {
		return "id";
	}
	if (typeof obj == 'null') {
		return "id";
	}
	if (typeof obj == 'function') {
		return null;
	}
	if (typeof obj == 'string') {
		return "NSString"
	}
	if (typeof obj == 'boolean') {
		return "NSNumber"
	}
	if (typeof obj == 'object') {
		if (gettype.call(obj)=="[object Object]") {
			return "Object";
		}
		if (gettype.call(obj)=="[object Array]") {
			return "Array";
		} 
		if (gettype.call(obj)=="[object Null]"){
			return "id";
		}
	}
}

function Class(name){
	this.name = name;
	this.property = new Array();
}



