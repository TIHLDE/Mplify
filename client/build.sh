echo '-- npm run build --\n'

npm run build

echo '\n\n -- '

docker build . -t tihlde/mplify-web:latest

