'Root path where all folders and files are present
'Change according to your requirement

strPath="C:\Users\gpusey\Documents\GitHub\chamois.github.io\"

Set objFso = CreateObject("Scripting.FileSystemObject")

'To access folders
Set objFolder = objFso.GetFolder (strPath)

TraverseFolder (objFso.GetFolder(strPath))

Function TraverseFolder(FolderName)
    For Each fld in FolderName.SubFolders
        TraverseFolder(fld) 
        For Each flname in fld.Files 
            if objFso.GetFileName(flname.Path)="index.html" then
                'msgbox fld.Path & "\" & objFso.GetFileName(flname.Path)

                Set objFile = objFso.OpenTextFile(fld.Path & "\" & objFso.GetFileName(flname.Path), 1)

                strText = objFile.ReadAll
                objFile.Close

                strText= Replace(strText, "#c0c0c0", "#3b5f7b")

strText= Replace(strText, " --> -->", " -->")

                strText= Replace(strText, "<div id='link' style='position: absolute; text-align: center; width: 100%;'><a  style='font-family: verdana; font-size: 11px; color: #0000CC;' href='http://www.ispringsolutions.com/go/ispring-presentations?ref=free-player-link' title='Create e-Learning courses in PowerPoint with iSpring Authoring tools'>Created with iSpring E-Learning Software</a></div>", " ")
                'strText= Replace(strText, "Database\Sy", "Database\SQ")
                strText= Replace(strText, "<html style=background-color:#3b5f7b;>", "<!-- < html style=background-color:#3b5f7b;> -->")
strText= Replace(strText, "{background-color:#3b5f7b;}", "<!-- {background-color:#3b5f7b;} -->")                
Set objFile = objFso.OpenTextFile(fld.Path & "\" & objFso.GetFileName(flname.Path), 2)

                objFile.WriteLine strText
                objFile.Close
				
            End If
        Next
    Next
	
End Function
msgbox("done bro!")