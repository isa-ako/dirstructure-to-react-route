/**
 * DirStructure to React Route
 * a generator that will generate react routes
 * based on how you structure your directory
 * 
 * note: still not ready for production
 * 
 * writer: Isa Ako
 * https://github.com/isa-ako/dirstructure-to-react-route
 */

const fs = require("fs")
const path = require("path")

const getAllFiles = function (dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (file !== "_error" && file !== "component" && file !== "components") {
        // will crawl every directory except component and _error
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
      }
    } else {
      if (file[0] !== ".") {
        let path_ = path.join(dirPath, "/", file)
        let data = {
          fileName: file,
          path: path_,
          parent: dirPath
        }
        arrayOfFiles.push(data)
      }
    }
  })

  return arrayOfFiles
}

const dirParent = process.argv[2];
const result = getAllFiles("./" + dirParent)

console.log("\nDirectory Structure\n")
console.log(result)

result.forEach(function (val, id) {
  route = val.path.replace(/.js/, "")
  route = route.replace(dirParent, "")

  dirparent_split = dirParent.split('/')
  importpath = dirparent_split[(dirparent_split.length - 1)] + route

  file_ = val.fileName.replace(/.js/, "")
  file_ = file_.replace(/__/, "_-")
  let [file, ...params] = file_.split('_')

  crop = file_.length
  route = route.substr(0, (route.length - crop))
  route += file
  route = route.replace(/index/, "")

  parent_split = val.parent.split('/')
  if (file == "index") file = parent_split[(parent_split.length - 1)]

  modname = file[0].toUpperCase() + file.slice(1)

  params.forEach(function (prm) {
    cekstrip = !!~prm.indexOf("-", 0)
    if (cekstrip) prm = prm.replace(/-/, "") + "?"
    route += "/:" + prm
  })

  result[id] = { componentName: modname, routePath: route, importPath: importpath }
})

console.log("\nGenerated Routes\n")
console.log(result)

// write GeneratedRoutes.js
let texts =
`
import React from 'react'
import { Route, BrowserRouter, Switch } from 'react-router-dom'
`
result.forEach(function(val){
  texts += `import ${val.componentName} from '${val.importPath}'` + "\n"
})

texts += 
`
export default function GeneratedRoutes(props) {
  return (
      <BrowserRouter basename={props.basepath}>
        <Switch>
` + "\n"

result.forEach(function(val){
  texts += `<Route exact path="${val.routePath}" component={${val.componentName}} />` + "\n"
})

texts += 
`
          {/* if path not found */}
        </Switch>
      </BrowserRouter>
  )
}
`

// write to a new file
fs.writeFile('GeneratedRoutes.js', texts, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('Routes Generated!');
});
