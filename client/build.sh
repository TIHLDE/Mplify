echo '-- npm run build --\n'

npm run build

echo '\n\n -- building docker image -- '

docker build . -t tihlde/mplify-web:latest

echo '\n\n -- pushing docker image -- '

docker push tihlde/mplify-web:latest

