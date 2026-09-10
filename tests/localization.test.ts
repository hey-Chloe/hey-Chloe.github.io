import assert from "node:assert/strict";
import test from "node:test";
import { localePath,contentHref } from "../lib/localization";

test("language switching retains semantic page routes without duplicating locale prefixes",()=>{
 for(const path of ["/","/research/","/research/ordered-agent-credit/","/projects/#engineering","/writing/note/?view=all#references"]){
  const en=localePath(path,"en");
  assert.equal(localePath(en,"zh"),path);
  assert.equal(localePath(en,"en"),en);
 }
 assert.equal(localePath("/en","zh"),"/");
 assert.equal(localePath("/en?view=all#main","zh"),"/?view=all#main");
});
test("content links localize pages while preserving shared downloads and external destinations",()=>{
 assert.equal(contentHref("/research/study/#method","en"),"/en/research/study/#method");
 assert.equal(contentHref("/research?view=all#main","en"),"/en/research?view=all#main");
 assert.equal(contentHref("/?view=all#main","en"),"/en/?view=all#main");
 for(const href of ["/archive/","/archive/garden/","/images/figure.webp","/cv.pdf","/data/results.json","#reference","https://github.com/hey-Chloe"]){assert.equal(contentHref(href,"en"),href);}
});
