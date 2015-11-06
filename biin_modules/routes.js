module.exports = function(app,db, passport,multipartMiddleware){

    //Others routes
    var routes = require('../routes')();
    var dashboard = require('../routes/dashboard')();
    var accounts = require('../routes/accounts')();
    var clients = require('../routes/clients')();
    var organizations = require('../routes/organizations')();
    var showcases = require('../routes/showcases')(db);
    var sites = require('../routes/sites')();
    var regions = require('../routes/regions')(db);
    var biins = require('../routes/biins')(db);
    var errors = require('../routes/errors')(db);
    var elements = require('../routes/elements')();
    var categories = require('../routes/categories')();
    var gallery = require('../routes/gallery')();
    var blog = require('../routes/blog')();
    var mobileUser = require('../routes/mobileUser')();
    var oauthMobileAPIGrants = require('../routes/oauthMobileAPIGrants')();
    var mobileOauthManager= require('./mobileOauthManager');
    var stickers = require('../routes/stickers')();
    var mobileRoutes = require('../routes/mobileRoutes')();
    var sysGlobals = require('../routes/sysGlobals')();
    var biinBiinieObjects =require('../routes/biinBiinieObjects')();
    var venues =require('../routes/venue')();

    //Restricted login pages function
    var restrict =function(req, res, next) {
      if (req.user) {
        next();
      } else {
        req.session.error = 'Access denied!';
        res.redirect('/');
      }
    }

    //Sys routes
    app.post('/enviroments', sysGlobals.set)
    var maintenance = require('../routes/maintenance')();

    //Application routes
    app.get('/sendEmail', routes.sendEmail)
    app.get('/partials/:filename', routes.partials);
    app.get('/', routes.index);
    app.get('/dashboard', routes.dashboard);
    app.get('/login',routes.login);
    app.get('/home',restrict,routes.home);
    app.get('/singup',routes.singup);
    app.get('/mobileAPI',routes.mobileAPI);
    app.get('/preregister/:packageSlected/:accept',routes.preregister);
    app.get('/preorder/:packageSlected/:accept',routes.preorder);
    app.get('/preregister/:packageSlected',routes.preregister);
    app.get('/preorder/:packageSlected',routes.preorder);
    app.get('/termsAndConditions/:backPage',routes.terms);
    app.get('/privacypolicy',routes.privacyPolicy);
    app.get('/support',routes.support);
    app.post('/api/singup',clients.set);
    app.get('/client/:identifier/activate',clients.activate);
    app.post('/client/:identifier/activate',clients.activate);
    app.post('/login',passport.authenticate('clientLocal',{
        failureRedirect:'/login',
        successRedirect:'/dashboard'
    }));
    app.get('/mobileTest',routes.mobileTest);

    //Dashboard
    //app.get('/dashboard', dashboard.index);
    app.get('/api/dashboard', dashboard.get);
    app.get('/api/dashboard/set', dashboard.set);
    app.get('/api/dashboard/comparative', dashboard.getComparativeData);
    app.get('/api/dashboard/visits', dashboard.getVisitsReport);
    app.get('/api/dashboard/notifications', dashboard.getNotificationReport);
    app.get('/api/dashboard/local/visits/newvsreturning', dashboard.getNewVisitsLocal);

    //Dashboard Mobile
    app.get('/api/dashboard/mobile/sessions', dashboard.getSessionsMobile);
    app.get('/api/dashboard/mobile/newvisits', dashboard.getNewVisitsMobile);
    app.get('/api/dashboard/mobile/totalbiined', dashboard.getTotalBiinedMobile);
    app.get('/api/dashboard/mobile/visitedelements', dashboard.getVisitedElementsMobile);
    app.get('/api/dashboard/mobile/newsvsreturning', dashboard.getNewVsReturningMobile);

    //Dashboard Locals
    app.get('/api/dashboard/local/sessions', dashboard.getSessionsLocal);
    app.get('/api/dashboard/local/newvisits', dashboard.getNewVisitsLocal);
    app.get('/api/dashboard/local/fromvisits', dashboard.getFromVisitsLocal);
    app.get('/api/dashboard/local/newsvsreturning', dashboard.getNewVsReturningLocal);


    //Acounts Routes
    app.get('/accounts',restrict,accounts.index);
    app.put('/api/accounts',accounts.set);
    app.post('/api/accounts/:organizationIdentifier/default',accounts.setDefaultOrganization);
    app.get('/api/accounts',accounts.list);

    app.post('/api/imageProfile',multipartMiddleware,accounts.uploadImageProfile);

    //Categories Routes
    app.get('/api/categories',categories.list);
    app.get('/api/categories/set', categories.set)

    //Organization Routes
    app.get('/organizations',restrict,organizations.index);
    app.get('/api/organizations',organizations.list);

    app.post('/api/organizations/:identifier',organizations.set);
    app.put('/api/organizations/:accountIdentifier',organizations.create);

    app.post('/api/organizations/:identifier/image',multipartMiddleware,organizations.uploadImage);

    app.delete('/api/organizations/:identifier',organizations.delete);
    app.post('/organizations/imageUpload',multipartMiddleware,showcases.imagePost);
    app.post('/organizations/imageCrop',multipartMiddleware,showcases.imageCrop);
    app.get('/api/organizations/:identifier/:siteIdentifier/minor', organizations.getMinor);

    //Showcase routes
    app.get('/organizations/:identifier/showcases',restrict,showcases.index);
    app.get('/api/organizations/:identifier/showcases/id',showcases.getShowcaseId);
    app.post('/api/organizations/:identifier/site/showcases',organizations.setShowcasesPerSite);

    //Showcases creation
    app.post('/api/organizations/:identifier/showcases',showcases.set);

    //Showcases Update
    app.put('/api/organizations/:identifier/showcases/:showcase',showcases.set);
    app.post('/showcases/imageUpload',multipartMiddleware,showcases.imagePost);
    app.post('/showcases/imageCrop',multipartMiddleware,showcases.imageCrop);
    app.get('/api/showcases/:identifier',showcases.get);
    app.put('/api/showcases/:showcase',showcases.set);
    app.delete('/api/organizations/:identifier/showcases/:showcase',showcases.delete);
    app.get('/api/organizations/:identifier/showcases',showcases.list);


    //Sites routes
    app.get('/organizations/:identifier/sites',restrict,sites.index);
    app.get('/site/mapComponent',sites.mapComponent);
    app.get('/api/organizations/:identifier/sites',sites.get);
    app.post('/api/organizations/:orgIdentifier/sites',sites.set);

    //Maintenance
    app.get('/maintenance',restrict,maintenance.index);
    app.get('/maintenance/organizations',maintenance.getOrganizationInformation);
    app.get('/maintenance/addBiinToOrganizationModal',maintenance.addBiinToOrganizationModal);
    app.get('/maintenance/getBiinsOrganizationInformation/:orgIdentifier',maintenance.getBiinsOrganizationInformation);
    app.put('/maintenance/insertBiin',maintenance.biinPurchase);
    app.post('/maintenance/insertBiin',maintenance.biinPurchase);
    app.get('/maintenance/beaconChildren',maintenance.getBeaconChildren);

    //Biins Purchase
    app.post('/api/organizations/:orgIdentifier/sites/:siteIdentifier/biins/',sites.biinPurchase);

    //Update a Site
    app.put('/api/organizations/:orgIdentifier/sites/:siteIdentifier',sites.set);
    app.post('/api/organizations/:orgIdentifier/sites/:siteIdentifier/region',sites.addSiteToRegion);

    //Create a biin
    app.put('/api/organizations/:orgIdentifier/sites/:siteIdentifier/purchase',sites.biinPurchase);
    app.delete('/api/organizations/:orgIdentifier/sites/:siteIdentifier',sites.delete);

    //Biins
    app.get('/organizations/:identifier/biins',restrict,biins.index);
    app.get('/api/biins',biins.list);
    app.post('/api/organizations/:identifier/sites/biins',biins.updateSiteBiins);
    app.get('/api/organizations/:identifier/biins',biins.getByOrganization);
    app.post('/api/organizations/:identifier/biins/:biinIdentifier/objects',biins.setObjects);
    app.post('/api/biins/:biinIdentifier/update',biins.updateBiin);

    //Elements
    app.get('/organizations/:identifier/elements',restrict, elements.index);
    app.post('/elements/imageUpload',multipartMiddleware,showcases.imagePost);
    app.post('/elements/imageCrop',multipartMiddleware,showcases.imageCrop);
    app.get('/_partials/galleryWidget',elements.galleryWidget);

    //Element List
    app.get('/api/organizations/:identifier/elements',elements.list)
    //Element Creation
    app.post('/api/organizations/:identifier/elements',elements.set);
    //Element Update
    app.put('/api/organizations/:identifier/elements/:element',elements.set);
    app.delete('/api/organizations/:identifier/elements/:element',elements.delete);

    //Regions routes
    app.get('/regions',restrict,regions.index)
    app.get('/regions/add',regions.create);
    app.post('/regions/add',regions.createPost);
    app.get('/regions/:identifier',regions.edit);
    app.post('/regions/:identifier',regions.editPost);

    //app.get('/api/regions',regions.listJson);
    //app.get('/api/regions/:region/biins',biins.listJson);
    app.post('/mobile/regions/:identifier/:latitude/:longitude',regions.setCoordsToRegion);//Update the Coords of a region

    //Gallery Routes
    app.get('/organizations/:identifier/gallery', restrict,gallery.index);
    app.get('/api/organizations/:identifier/gallery',gallery.list);
    app.post('/api/organizations/:identifier/gallery', multipartMiddleware,gallery.upload);

    //Utilities Routes
    app.get('/errors',restrict,errors.index);
    app.post('/api/errors/add',errors.create);

    //Client routes
    app.get('/client',clients.create);
    app.get('/logout',clients.logout);
    app.post('/api/clients/verify', clients.verifyEmailAvailability);

    //Stickers services
    app.get('/api/stickers',stickers.get);
    app.get('/api/stickers/create',stickers.set);

    //Binnies Routes
    app.get('/biinies',restrict,mobileUser.index);
    app.get('/api/biinies',mobileUser.get);
    app.put('/api/biinies',mobileUser.set);
    app.delete('/api/biinies/:identifier',mobileUser.delete);
    app.post('/api/biinies/:identifier/image',multipartMiddleware,mobileUser.uploadImage);

    //Mobile Binnies services
    app.get('/mobile/biinies/:firstName/:lastName/:biinName/:password/:gender/:birthdate',mobileUser.setMobileByURLParams);
    app.get('/mobile/biinies/:identifier/isactivate', mobileUser.isActivate);
    app.post('/mobile/biinies/:identifier/categories', mobileUser.setCategories);
    app.get('/mobile/biinies/auth/:user/:password', mobileUser.login);
    app.get('/mobile/biinies/:identifier',mobileUser.getProfile);
    app.put('/mobile/biinies',mobileUser.setMobile);
    app.post('/mobile/biinies/:identifier',mobileUser.updateMobile);

    //Mobile Biinies Share
    app.get('/mobile/biinies/:identifier/share',mobileUser.getShare);
    app.put('/mobile/biinies/:identifier/share',mobileUser.setShare);

    //Activation Routes
    app.get('/mobile/biinies/:identifier/isactivate',mobileUser.isActivate);
    app.get('/biinie/:identifier/activate',mobileUser.activate);
    app.post('/biinie/:identifier/activate',mobileUser.activate);

    app.get('/mobile/elements/:identifier',elements.getMobile);
    app.get('/mobile/biinies/:identifier/highlights',elements.getMobileHighligh);

    //Colections
    app.get('/mobile/biinies/:identifier/collections',mobileUser.getCollections);
    app.put('/mobile/biinies/:identifier/collections/:collectionIdentifier', mobileUser.setMobileBiinedToCollection);

    //collect
    app.put('/mobile/biinies/:identifier/collect/:collectionIdentifier', mobileUser.setMobileCollect);
    //uncollect
    app.delete('/mobile/biinies/:identifier/collect/:collectionIdentifier/element/:objIdentifier', mobileUser.deleteMobileCollectElementToCollection);
    app.delete('/mobile/biinies/:identifier/collect/:collectionIdentifier/site/:objIdentifier', mobileUser.deleteMobileCollectSiteToCollection);

    //follow
    app.put('/mobile/biinies/:identifier/follow', mobileUser.setFollow);
    app.put('/mobile/biinies/:identifier/unfollow', mobileUser.setUnfollow);
    //like
    app.put('/mobile/biinies/:identifier/like', mobileUser.setLiked);
    app.put('/mobile/biinies/:identifier/unlike', mobileUser.setUnliked);

    app.delete('/mobile/biinies/:identifier/collections/:collectionIdentifier/element/:objIdentifier', mobileUser.deleteMobileBiinedElementToCollection);
    app.delete('/mobile/biinies/:identifier/collections/:collectionIdentifier/site/:objIdentifier', mobileUser.deleteMobileBiinedSiteToCollection);

    //Biinie Loyalty
    //Biinie Loyalty
    app.get('/mobile/biinies/:identifier/organizations/:organizationIdentifier', mobileUser.getOrganizationInformation);
    app.put('/mobile/biinies/:identifier/organizations/:organizationIdentifier/loyalty/points', mobileUser.setMobileLoyaltyPoints);

    //Biin Biinie Object Relation setters
    app.put('/mobile/biinies/:biinieIdentifier/biin/:biinIdentifier/object/:objectIdentifier/biined',biinBiinieObjects.setBiined)
    app.put('/mobile/biinies/:biinieIdentifier/biin/:biinIdentifier/object/:objectIdentifier/notified',biinBiinieObjects.setNotified)

    //Biinie/ Site relation
    app.put('/mobile/biinies/:biinieIdentifier/sites/:siteIdentifier/showcase/:showcaseIdentifier/notified',mobileUser.setShowcaseNotified);

    //Stars/Rating
    app.post('/mobile/biinies/:biinieIdentifier/sites/:siteIdentifier/rating/:rating',mobileRoutes.setSiteRating);
    app.post('/mobile/biinies/:biinieIdentifier/elements/:elementIdentifier/rating/:rating',mobileRoutes.setElementRating)

    //Venues
    app.get('/api/venues/search',venues.getVenueALike);
    app.put('/api/venues/create',venues.createVenue);

    //Mobile routes    /:
    /*app.put('/mobile/client/grant',oauthMobileAPIGrants.set);
    app.put('/mobile/client',passport.authenticate(['mobileClientBasic', 'mobileClientPassword']), mobileUser.set);
    app.post('/mobile/client/token', mobileOauthManager.token);
    app.get('/mobile/regions', passport.authenticate('mobileAccessToken', { session: false }),regions.listJson);*/

    app.get('/mobile/regions',regions.listJson);
    app.get('/mobile/:identifier/:xcord/:ycord/categories',mobileRoutes.getCategories);
    app.get('/mobile/biinies/:identifier/:latitude/:longitude/categories',sites.getMobileByCategories);

    app.get('/mobile/biinies/:biinieIdentifier/elements/:identifier',elements.getMobile);

    app.get('/mobile/biinies/:biinieIdentifier/sites/:identifier',mobileRoutes.getSite);
    app.get('/mobile/biinies/:biinieIdentifier/showcases/:identifier',showcases.getMobileShowcase);


    //Mobile History
    app.put('/mobile/biinies/:identifier/history',mobileRoutes.setHistory)
    app.get('/mobile/biinies/:identifier/history',mobileRoutes.getHistory)

    app.get('/blog/',restrict, blog.index);
    app.get('/api/blog', blog.list);
    app.get('/public/blog/:year/:month/:day/:title', blog.entry);
    //Blog routes

    //Utils
    app.get('/sites/update/validation',sites.setSitesValid);

    /// catch 404 and forwarding to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });
}
