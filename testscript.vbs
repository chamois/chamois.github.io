
  set fso = createobject("scripting.filesystemobject")
  path = "./"
  realpath = "C:\Users\gpusey\Documents\GitHub\chamois.github.io\"
  response.write "Contents of """ & realpath & """<hr>"
  set folder = fso.getfolder(realpath)
  for each file in folder.files
    response.write _
      "<a href='" & path & file.name & "'>" _
    & file.name _
    & "</a><br>"
  next
