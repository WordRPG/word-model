#
# Adds a pip package and updates requirements.txt.
# 

echo "--- INSTALLING PACKAGES"
pip install $@

echo "--- UPDATING requirement.txt"
pip freeze > requirements.txt

echo "--- DONE."