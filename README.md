# sk-cors
Some server didn't support CORS, so I create a server as a proxy for that server. I can use this to get data from that server don't support  CORS

##How to use
Same with how you send request before, the only different is you need to pass the target host url as a query or data parameter, the key is `_target_`. If you both pass on query or data parameter, data parameter will overwrite query.
