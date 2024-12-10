#
# Adds a node package and links the project folder.
#
echo "--- INSTALLING PACKAGES"
npm install $@

echo "--- LINKING IVFFLAT FOLDER" 
npm link ../ivfflat

echo "--- LINKING PROJECT FOLDER"
ln -s ../ node_modules/word-model

echo "--- DONE."