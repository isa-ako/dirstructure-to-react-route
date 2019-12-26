const fs = require("fs")
const path = require("path")

const getAllFiles = function (dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      let path_ = path.join(dirPath, "/", file)
      let data = {
        fileName: file,
        path: path_,
        parent: dirPath
      }
      arrayOfFiles.push(data)
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
  importpath = dirparent_split[ (dirparent_split.length-1) ] + route

  file_ = val.fileName.replace(/.js/, "")
  let [file, ...params] = file_.split('_')

  crop = file_.length
  route = route.substr(0, (route.length-crop))
  route += file
  route = route.replace(/index/, "")

  parent_split = val.parent.split('/')
  if(file=="index") file = parent_split[ (parent_split.length-1) ]

  modname = file[0].toUpperCase() + file.slice(1)

  params.forEach(function(prm){
    cekstrip = !!~prm.indexOf("-", 0)
    if(cekstrip) prm = prm.replace(/-/, "") + "?"
    route += "/{" + prm + "}"
  })

  result[id] = {moduleName: modname, routePath: route, importPath: importpath }
})

console.log("\nGenerated Routes\n")
console.log(result)
