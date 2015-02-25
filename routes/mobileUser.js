module.exports = function(){
	//Schemas
	var mobileUser = require('../schemas/mobileUser'), 
		util = require('util'),
		bcrypt = require('bcrypt'),
		imageManager=require('../biin_modules/imageManager')(),
		utils =require("../biin_modules/utils")();

	var functions ={};

	//GET the Main view of an Binnies
	functions.index = function(req, res){
		res.render('binnie/index', { title: 'Binnies list' ,user:req.user,organization:null});
	}

	//Get the list of Binnies
	functions.get = function(req,res){
		var prototype = new mobileUser();

		res.setHeader('Content-Type', 'application/json');
		mobileUser.find({},function(err,binnies){
			if(err)
				res.send(500);
			else
				res.json({data:binnies, prototype:prototype});
		});
	}

	//Get the profile of a biinnie
	functions.getProfile = function(req,res){
		var identifier= req.param('identifier');

		//Find the mobile user
		mobileUser.findOne({identifier:identifier},{"identifier":1,"email":1, "biinName":1,"firstName":1,"birthDate":1,"accountState":1,"gender":1,"lastName":1,"imgUrl":1,"friends":1,"biins":1,"following":1,"followers":1},function(err,foundBinnie){
			if(err)
				res.json({data:{status:"5",result:""}});
			else{
				var isFound = typeof(foundBinnie)!=='undefined' && foundBinnie!==null;
				if(!isFound)
					res.json({data:{status:"7"}});
				else{
					var result = foundBinnie.toObject();
					result.isEmailVerified = foundBinnie.accountState?"1":"0";
					delete result.accountState;
					res.json({data:result,status:"0"});
				}
			}
		});
	}

	//Get The Biinie Biined Collections
	functions.getCollections =function(req,res){
		res.setHeader('Content-Type', 'application/json');
		var identifier =req.param("identifier");
		mobileUser.findOne({"identifier":identifier},{_id:0,biinieCollections:1},function(err,data){
			if(err)
				res.json({data:{status:"5", result:"0"}});	
			else
				if(data!=null && data.biinieCollections!=null && data.biinieCollections.length>0){
					res.json({data:{biinieCollections:data.biinieCollections},status:"1"});						
				}else{
					res.json({data:{status:"9", result:"0"}});	
				}
		});
	}

	//PUT a new Mobile User
	functions.set = function(req,res){

		res.setHeader('Content-Type', 'application/json');
		var model =req.body['model'],
				   joinDate = utils.getDateNow(),
				   accountState = 'active';

		if('isNew' in model){
			 
			mobileUser.findOne({biinName:model.biinName},function(err,mobileUserAccount){
				if(mobileUserAccount){
					res.send('The Account Name is already taken');
				}else{
					bcrypt.hash(model.password, 11, function (err, hash) {

						var newModel = new mobileUser({
							identifier: utils.getGUID(),
							firstName:model.firstName,
							lastName:model.lastName,
							biinName:model.biinName,
							password:hash,
							tempPassword:model.password,
							birthDate:model.birthDate?model.birthDate:"",
							gender:model.gender?model.gender:"",
							joinDate:joinDate,
							accountState:accountState,
							comments:model.comments?model.comments:"",
							userBiined:model.userBiined?model.userBiined:"",
							userCommented:model.userCommented?model.userCommented:"",
							userShared:model.userShared?model.userShared:"",
							categories:model.categories?model.categories:[],
							imgUrl:model.imgUrl?model.imgUrl:""
						});

						//Save The Model
						newModel.save(function(err){
							if(err)
								throw err;
							else
								res.send(201);
						});
			 		});
				}
			});
		}else{//Update the Binnie information profile
			mobileUser.update(
				{identifier:model.identifier},
				{
					firstName:model.firstName,
					lastName:model.lastName,
					birthDate:model.birthDate?model.birthDate:"",
					gender:model.gender?model.gender:"",
					comments:model.comments? model.comments:"",
					userBiined:model.userBiined? model.comments:"",
					userCommented:model.userCommented? model.userCommented:"",
					userShared:model.userShared? model.userShared:"",
					categories:model.categories? model.categories:[],
					imgUrl:model.imgUrl?model.imgUrl:""
				},
				function(err,cantUpdate){
					if(err)
						res.send(err,500);
					else
						res.send(201)
				}
			);
		}				   
		/*
		var errors = null;//utils.validate(new mobileUser().validations(),req,'');
		if (errors) {
        	res.send(errors, 400)
    	} else {

		}	*/
	}

	//POST the Categories of an Mobile User
	functions.setCategories =function(req,res){
		var identifier = req.param("identifier");
		res.setHeader('Content-Type', 'application/json');

		var categoriesModel = req.body['model'];

		mobileUser.update({identifier:identifier},{categories:categoriesModel},function(err,count){
			if(err)
				res.json({data:{status:"7",result:""}})
			else{
				res.json({data:{status:"0", result: count?"1":"0"}});
			}
		})
	}

	//SET a new Mobile user Takin the params from the URL **To change **Deprecated 
	functions.setMobileByURLParams =function(req,res){
		var model ={};
		model.firstName = req.param('firstName');
		model.lastName = req.param('lastName');
		model.biinName= req.param('biinName');
		model.password= req.param('password');
		model.gender= req.param('gender');
		model.birthDate = utils.getDateNow();
		//** Set that the email is the same as biinName
		model.email = model.biinName;
		req.body.model = model;
		functions.setMobile(req,res);
	}

	//Set a new Mobile User 
	functions.setMobile = function(req,res){

		var model =req.body.model;		
		res.setHeader('Content-Type', 'application/json');
		var errors = utils.validate(new mobileUser().validations(),req,'model');
		if(!errors){
			mobileUser.findOne({biinName:model.biinName},function(err,mobileUserAccount){
					if(mobileUserAccount){
						res.json({data:{status:"1",identifier:""}});
					}else{
						bcrypt.hash(model.password, 11, function (err, hash) {
							var joinDate = utils.getDateNow();
							var identifier= utils.getGUID();

							//Build the default Biined Collection
							var collectionIdentifier= utils.getGUID();
							var defBiinedCollection = [{
								identifier:collectionIdentifier,
								subTitle:"This is a list of all your biined elements and sites.",
								title:"Biined elements and sites",
								elements:[],
								sites:[]
							}];

							var newModel = new mobileUser({
								identifier: identifier,
								firstName:model.firstName,
								lastName:model.lastName,
								biinName:model.biinName,
								email:model.email,
								password:hash,
								birthDate:model.birthDate,
								tempPassword:model.password,
								gender:model.gender,
								joinDate:joinDate,
								accountState:false,
								biinieCollections:defBiinedCollection
							});

							//Save The Model
							newModel.save(function(err){
								if(err)
									res.json({data:{status:"5", result:"0",identifier:""}});	
								else{

									//Send the verification of the e-mail
									sendVerificationMail(req,newModel,function(){
										//callback of mail verification
										res.json({data:{status:"0", result:"1",identifier:identifier}});	
									});
								}
																	
							});
				 		});
					}
				});			
		}
		else{
			res.send({data:{status:"6",errors:errors}});
		}
	}

	//POST a new Biined Element
	functions.setMobileBiinedElement=function(req,res){
		var identifier=req.param("identifier");
		var collectionIdentifier= req.param("collectionIdentifier");

		var model = req.body.model;
		
		if(identifier && model){
			var obj={identifier:model.identifier,"_id":model._id};
			mobileUser.update({identifier:identifier,
				"biinieCollections.identifier":collectionIdentifier},
				{$push:{"biinieCollections.$.elements":obj}},function(err, affectedDocs){
					if(err){
						res.json({status:"5", result:"0",data:{}});	
					}else{
						if(affectedDocs>0)
							res.json({status:"0",result:"1"});	
						else
							res.json({status:"1",result:"0"});	
					}
				});
		}
	}
	//Update by mobile Id
	functions.updateMobile =function(req,res){

		var model = req.body.model;
		var identifier = req.param("identifier");

		var updateModel = function(model){
			var birthDate = utils.getDate(model.birthDate);
			mobileUser.update({identifier:identifier},{biinName:model.email,firstName:model.firstName, lastName:model.lastName,email:model.email, gender:model.gender,birthDate:birthDate,accountState:false},function(err,count){
				if(err)
					res.json({data:{status:"5", result:"0"}});	
				else
				{
					var status = count>0?"0":"9";
					var result = count>0?"1":"0";

					//Send the email verification if all is ok.
					if(count>0){
						model.identifier = identifier;
						model.biinName= model.email;
						sendVerificationMail(req,model,function(){
							res.json({data:{status:status, result:result}});		
						})
					}else
					{
						res.json({data:{status:status, result:result}});		
					}
					
				}
			})
		}
		//Chek if the User exist and if the e-mail is available
		if(model && identifier){
			mobileUser.findOne({biinName:model.email},function(err,foundEmail){
				if(err)
					res.json({data:{status:"5", result:"0"}});	
				else
					if(typeof(foundEmail)==="undefined" || foundEmail===null){
						updateModel(model);
					}else{
						if(foundEmail.identifier === identifier)
							updateModel(model);
						else{
							res.json({data:{status:"1", result:"0"}});		
						}
					}
			})
			
		}
	}

	//Get the authentication of the user **To change **Deprecated 
	functions.login =function(req,res){
		var user =req.param('user');
		var password= req.param('password');

		mobileUser.findOne({biinName:user},function(err,foundBinnie){
			if(err)
				res.json({data:{status:"5",identifier:""}});	
			else
			{
				var result = typeof(foundBinnie)!=='undefined' && foundBinnie!==null;
				var identifier="";
				if(result){
					foundBinnie.comparePassword(password,function(err,isMath){
					identifier = foundBinnie.identifier;
					var isMathToString = isMath? "1":"0";
					var code = isMath ? "0" :"8";
					res.json({data:{status: code, result:isMathToString, identifier:identifier}});
				})
					
				}else{
					res.json({data:{status:"7", result:"0", identifier:identifier}});					
				}
				
			}
			
		})
	}

	//GET/POST the activation of the user
	functions.activate=function(req,res){
		var identifier = req.param("identifier");
		mobileUser.findOne({identifier:identifier, accountState:false},function(err, foundBinnie){
			if(err)
				res.send(500,"The user was not found")
			else{
				if(typeof(foundBinnie)==='undefined'|| foundBinnie===null)
					res.send(500,"The user was not found")	

				foundBinnie.accountState=true;
				foundBinnie.save(function(err){
					if(err)
						res.send(err, 500);
					else{
							//Return the state and the object
							res.json("/verifiedBinnie");											
						}
				});		
			}
		})
	}

	//Get if an Biinie is active
	functions.isActivate=function(req,res){
		var identifier = req.param("identifier");
		res.setHeader('Content-Type', 'application/json');
		mobileUser.findOne({identifier:identifier, accountState:true},function(err, foundBinnie){
			if(err)
				res.json({data:{status:"7",result:""}})
			else{
				var result = typeof(foundBinnie)!=='undefined' && foundBinnie!==null;
				res.json({data:{status:"0", result:result}});
			}
		});
	}

	//Send an e-mail verification
	function sendVerificationMail(req,model,callback){

		var transporter = require('nodemailer').createTransport({
	        service: 'gmail',
	        auth: {
	            user: process.env.EMAIL_ACCOUNT,
	            pass: process.env.EMAIL_PASSWORD
	        }
	    });

		var url= req.protocol + '://' + req.get('host')+"/biinie/"+model.identifier+"/activate";
		var subject ="Wellcome to Biin";
		var htmlBody = "<h3>"+subject+"</h3>" +
                    "<b>Hi</b>: <pre style='font-size: 14px'>" + model.firstName + "</pre>" +                    
                    "<b>Thanks for join Biin</b>" +
                    "<b>Your user is </b>: <pre style='font-size: 14px'>" + model.biinName + "</pre>" +
                    "<b>In order to complete your registration please visit the following link</b><a href='"+url+"'> BIIN USER ACTIVATION </a>";

        // setup e-mail data with unicode symbols
		var mailOptions = {
			// sender address
		    from: "[ BIIN NO REPLY] <" + process.env.EMAIL_ACCOUNT + ">",

		    // list of receivers
		    to: model.biinName,

		    // Subject line
		    subject: subject,

		    // plaintext body
		    text: "",

		    // html body
		    html: htmlBody
		};
		// send mail with defined transport object
		transporter.sendMail(mailOptions, function(error, info){
		    callback();
		});		
	}

	//DELETE an specific showcase
	functions.delete= function(req,res){
		//Perform an update
		var identifier = req.param('identifier');
				
		mobileUser.remove({identifier:identifier},function(err){
			if(err)
				res.send(err,500)
			else
				res.send(200);
		});
	}

	//Post the Image of the Organization
	functions.uploadImage = function(req,res){
		//Read the fileer.name;
		var binnieIdentifier =req.param("identifier");
		res.setHeader('Content-Type', 'application/json');

 		if(!util.isArray(req.files.file)){

 			var file =req.files.file;

	 		//var data = fs.readFileSync(file.path);
	 		var imagesDirectory = 'binnies';
	 		var systemImageName = '/media/'+ binnieIdentifier+"/"+utils.getGUID()+"."+ utils.getExtension(file.originalFilename);
 			var imgURL= imageManager.uploadFile(file.path,imagesDirectory,systemImageName,false);	
 			var mediaObj={imgUrl:imgURL}; 			
			res.json({data:mediaObj});
 		} else{
 			res.send(err, 500);
 		}
	}		

	return functions;
}