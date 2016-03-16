killall node
rm nohup.out
nohup node crawler.js &
sleep 1
tail -f nohup.out