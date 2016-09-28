function calcRemaining(){

	var msg = $('#twitter textarea').val();
	var length = 140 - msg.length;
	$('.chars').text(length);

	$('#twitter .form-group').removeClass('has-warning');
	$('#twitter .form-group').removeClass('has-error');

	if(length >= 0 && length < 10){
		$('#twitter .form-group').addClass('has-warning');
	}

	if(length < 0){
		$('#twitter .form-group').addClass('has-error');
	}

}

function sendTweet(e){

	e.preventDefault();

	var msg = $('#twitter textarea').val()
	if(msg.length > 140){
		return
	}

	$.ajax({
		method: 'POST',
		url: '/twitter/send',
		data: {tweet: msg}
	}).done(function(){
		$('#twitter textarea').val('');
		$('.chars').text(140);
		//todo add message success message
	})
}


$(document).ready(function(){
	console.log('ready');

	$('#twitter textarea').on('change keyup paste', calcRemaining);
	$('#twitter button').on('click',sendTweet);

})