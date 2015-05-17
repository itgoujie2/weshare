angular.module('weshare.config', [])

	//.constant('SERVER_URL', 'http://weshare-backend.herokuapp.com');
	//.constant('SERVER_URL', 'http://localhost:3000')
	.constant('SERVER_URL', 'http://weshare-lb-1245169689.us-west-2.elb.amazonaws.com:80');//load balancer
	//.constant('SERVER_URL', 'http://52.10.127.154:80');