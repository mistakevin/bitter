/**
 * Created by jared on 3/26/16.
 */
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});




var PostModel = Backbone.Model.extend({
    urlRoot: '/api/posts/',
    idAttribute: 'id'
});


var UserModel = Backbone.Model.extend({
    urlRoot: '/api/users/',
    idAttribute: 'id',

    // For /api/users/, when a response with "currentUser=true" is passed into the route, the route returns both a user
    // and all of its likes
    parse: function(response) {
        // If the current user has likes, turn that list of likes into a PostsCollection
        if(response.likes) {
            response.likes = new PostsCollection(response.likes);
        }
        return response;
    }
});

var PostsCollection = Backbone.Collection.extend({
    url: '/api/posts/',
    model: PostModel
});




var PostsListView = Backbone.View.extend({
    el: '<div class="post-list-container"></div>',

    // // Gets 'posts' as a parameter from render()
    // template: _.template('\
    //     <% posts.each(function(post) { %>\
    //         <div class="post-container" href="#">\
    //             <a class="post" data-id="<%= post.id %>" data-user-id="<%= post.get("user_id") %>">\
    //                 <%= post.get("post_content") %>\
    //                 <% if(post.get("user")) { %>\
    //                     <span data-id="<%= post.id %>" data-user-id="<%= post.get("user_id") %>">\
    //                         <br />\
    //                         @<%= post.get("user").name %>\
    //                     </span>\
    //                 <% }; %>\
    //             </a>\
    //             <div id="heart-normal">\
    //                 &hearts;\
    //             </div>\
    //         </div>\
    //     <% }); %>\
    // '),

    // initialize: function () {
    //     this.listenTo(this.collection, 'add', this.render);
    // },

    events: {
        'click .post': function(event) {

            // If the clicked link is invalid nothing happens
            event.preventDefault();

            var clickedUser = new UserModel({ id: $(event.target).data('user-id') });
            clickedUser.fetch({
                success: function() {
                    var posts = new PostsCollection(clickedUser.get('posts'));
                    posts.fetch();
                    var usersPostsListView = new PostsListView({ collection: posts });
                    $('#main-window').html(usersPostsListView.render().el);
                    $('#main-window').height("410px");
                    var mainTitle = "posts by @" + clickedUser.get('name');
                    $('#main-title').html(mainTitle);
                    $('#favorites-button').html("&rarr; click to see your favorites &larr;");
                    $('#error').html("");

                }
            });

            var clickedPost = new PostModel({ id: $(event.target).data('id') });
            clickedPost.fetch({
                success: function() {
                    var postDetailView = new PostDetailView({ model: clickedPost });
                    $('#post-viewer-container').html(postDetailView.render().el);
                }
            });
        }
    },


    // Gets 'collection' from HomeView's render(), which instantiates postListView with 'collection' as a parameter
    // This method automatically runs whenever its class is instantiated
    // initialize: function() {
    //     this.listenTo(this.collection, 'update', this.render);
    // },

    // Gets 'collection' from HomeView's render(), which instantiates postListView with 'collection' as a parameter
    render: function() {
        // this.$el.html(this.template({
        //     posts: this.collection,
        //     userLikesArr: this.userLikesArr
        // }));
        // return this;
        var that = this;
        console.log("d - " + this.userLikesArr);
        this.collection.forEach(function(post) {
            var postView = new PostView({
                model: post,
                userLikesArr: that.userLikesArr
            });
            that.$el.append(postView.render().el);
        });
        console.log(this.collection);
        console.log(this.userLikesArr);
        return this;
    }
});

var PostDetailView = Backbone.View.extend({
    el: '<div class="post-viewer"></div>',

    template: _.template('\
        <div class="title-post-viewer">\
            &darr; <%= model.get("post_content") %> &darr;\
        </div>\
        <div class="post-viewer-details">\
            <h4>\
                posted by @<%= model.get("user").name %>\
                <br />\
                <%= model.get("updated_at").substring(0,10) %>\
            </h4>\
        </div>\
    '),

    initialize: function() {
        this.listenTo(this.model, 'change', this.render);
    },

    render: function() {
        console.log(this.userLikesArr);
        this.$el.html(this.template({ model: this.model }));
        return this;
    }
});


var PostView = Backbone.View.extend({
    el: '<div class="post-container"></div>',

    template: _.template('\
        <a class="post" data-id="<%= post.id %>" data-user-id="<%= post.get("user_id") %>">\
            <%= post.get("post_content") %>\
            <% if(post.get("user")) { %>\
                <span data-id="<%= post.id %>" data-user-id="<%= post.get("user_id") %>">\
                    <br />\
                    @<%= post.get("user").name %>\
                </span>\
            <% }; %>\
        </a>\
        <div id="heart-normal">\
            &hearts;\
        </div>\
    '),

    initialize: function() {
        this.listenTo(this.model, 'change', this.render);
    },

    render: function() {
        this.$el.html(this.template({ post: this.model }));
        return this;
    }
});


var HomeView = Backbone.View.extend({
    el: '\
        <div class="container">\
            <div class="row">\
                <div class="four columns">\
                    <div class="row">\
                        <div class="twelve columns" id="content-container">\
                            <div class="title">all posts</div>\
                            <div id="all-posts"></div>\
                        </div>\
                    </div>\
                    <div class="row">\
                        <div class="twelve columns" id="content-container">\
                            <div class="title">create a post</div>\
                            <div id="post-form">\
                                <input type="text" id="new-post" name="new-post" placeholder="enter post" />\
                                <div id="error"></div>\
                                <div id="submit">submit</div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
                <div class="eight columns" id="content-container">\
                    <div class="title" id="main-title"></div>\
                    <a href="#">\
                        <div class="title-favorites" id="favorites-button"></div>\
                    </a>\
                    <div id="main-window"></div>\
                    <div id="post-viewer-container">\
                        <div class="title-post-viewer">&darr; post detail area &darr;</div>\
                        <div class="post-viewer-details">\
                            <br />\
                            <h4>no post clicked yet</h4>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>\
    ',

    // Initialize a UserModel and then fetch it with the response "currentUser=true", which will trigger the UserController's
    // index() to return the current user with all of their likes
    // initialize: function() {
    //     this.user = new UserModel();
    //
    //     this.user.fetch({
    //         data: {
    //             currentUser: true
    //         }
    //     });
    //
    //     // Listen to syncs on this.user. fetch() is asynchronous, so it won't run when it is first called, it will run
    //     // after everything else that isn't asynchronous has run. So when we fetch above it is actually just making
    //     // this.user into an empty shell. So if we were to just try to render the user's likes in the render() below, it
    //     // wouldn't work. Instead we need to have a function that adds the likes to the el that runs whenever this.user
    //     // syncs, and this.user syncs once it successfully runs fetch()
    //     this.listenTo(this.user, 'sync', this.insertLikes);
    // },

    events: {
        "click #submit": "createPost",

        "click #favorites-button": "insertLikes"
    },

    render: function() {

        var that = this;
        this.user = new UserModel();
        this.user.fetch({
            data: {
                currentUser: true
            },
            success: function() {
                // Create userLikes variable to hold all likes of current user
                that.userLikes = that.user.get('likes');

                // Create array of ids for liked posts
                that.userLikesArr = [];
                that.userLikes.forEach(function(like) {
                    that.userLikesArr.push(like.get('id'));
                });

                // It's important this comes after the other elements so this.userLikes and userLikesArr are populated
                // when they are called in the methods below

                // Insert user's likes into DOM, and pass along array
                that.insertLikes({ userLikesArr: that.userLikesArr });

                // Insert all posts into DOM, and pass along array
                that.insertAllPosts({ userLikesArr: that.userLikesArr });
            }
        });


        return this;
    },

    insertAllPosts: function() {
        var posts = new PostsCollection();
        var that = this;

        posts.fetch({
            success: function() {
                var postsListView = new PostsListView({
                    collection: posts,
                    userLikesArr: that.userLikesArr
                });
                // Make sure to say postsListView.render().el instead of postsListView.el so that the view actually renders
                that.$el.find('#all-posts').html(postsListView.render().el);
            }
        });
    },

    insertLikes: function() {
        // We passed the PostsListView the collection of this.user.get('likes') so that the collection the view renders is
        // the collection of 'likes' that we got from this.user
        var postsListView = new PostsListView({
            collection: this.userLikes,
            userLikesArr: this.userLikesArr
        });
        this.$el.find('#main-window').html(postsListView.render().el);
        this.$el.find('#main-title').html('your favorited posts');
        this.$el.find('#main-window').height("442px");
        this.$el.find('#favorites-button').html("");
        this.$el.find('#error').html("");
        //this.$el.find('#post-viewer-container').html("<div class='post-viewer-title'></div><h1>no post selected</h1>");
    },

    createPost: function() {

        //var postContent = $('#new-post').value;

        // Get the value of the text input
        var postContent = document.getElementsByName('new-post')[0].value;

        // If the input is empty, tell the user with an alert
        if(postContent === "") {

            $('#error').html("please enter a post");

            // Otherwise, create a new post, save it to the backend, re-render the posts to update the list, then clear
            // the text field
        } else {
            var newPost = new PostModel();
            newPost.set({
                post_content: postContent
            });

            newPost.save();

            this.insertAllPosts();

            $('#new-post').val("");

            $('#error').html("");


        }
    }
});



var homeView = new HomeView();
$('#content').html(homeView.render().el);


// QUESTIONS
// WHY ARE MY REQUESTS SHOWING UP TWICE?
// HOW TO GET NAMES TO SHOW UP NEXT TO EACH POST?
// IS THERE A BETTER WAY TO ADD A NEWLY CREATED POST TO THE LIST BESIDES CALLING THIS.INSERTALLPOSTS()? LIKE APPENDING
//   ONLY THE NEW POST ( this.$el.find('#all-posts').append(newPost) )