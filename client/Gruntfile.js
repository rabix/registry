// Generated on 2014-06-25 using generator-angular 0.9.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        dist: 'dist'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: appConfig,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
//            bower: {
//                files: ['bower.json'],
//                tasks: ['wiredep']
//            },
//      js: {
//        files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
//        tasks: ['newer:jshint:all'],
//        options: {
//          livereload: '<%= connect.options.livereload %>'
//        }
//      },
//      jsTest: {
//        files: ['test/spec/{,*/}*.js'],
//        tasks: ['newer:jshint:test', 'karma']
//      },
            sass: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['sass:server']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            template: {
                files: [
                    '<%= yeoman.app %>/views/{,*/}*.html',
                    '<%= yeoman.app %>/views/cliche/{,*/}*.html',
                    '<%= yeoman.app %>/views/app/{,*/}*.html',
                    '<%= yeoman.app %>/views/repo/{,*/}*.html',
                    '<%= yeoman.app %>/views/task/{,*/}*.html'
                ],
                tasks: ['ngtemplates:app', 'ngtemplates:integrate']
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true
                }
            },
            test: {
                options: {
                    port: 9001,
                    middleware: function (connect) {
                        return [
                            connect.static('.tmp'),
                            connect.static('test'),
                            connect().use(
                                '/bower_components',
                                connect.static('./bower_components')
                            ),
                            connect.static(appConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= yeoman.dist %>'
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
                    'Gruntfile.js',
                    '<%= yeoman.app %>/scripts/{,*/}*.js'
                ]
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/{,*/}*.js']
            }
        },

        // Empties folders to start fresh
        clean: {
            options: {
                force: true
            },
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            '.tmp',
                            '<%= yeoman.dist %>/{,*/}*',
                            '!<%= yeoman.dist %>/.git*',
                            '!<%= yeoman.dist %>/fonts',
                        ]
                    }
                ]
            },
            server: '.tmp'
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '.tmp/styles/',
                        src: '{,*/}*.css',
                        dest: '.tmp/styles/'
                    }
                ]
            }
        },

        // Automatically inject Bower components into the app
        wiredep: {
            options: {
                cwd: '<%= yeoman.app %>'
            },
            app: {
                src: ['<%= yeoman.app %>/index.html'],
                ignorePath: /..\//
            },
            sass: {
                src: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
                ignorePath: /(\.\.\/){1,2}bower_components\//
            }
        },

        sass: {
            server: {
                options: {
                    style: 'expanded',
                    sourcemap: 'auto'
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/styles',
                    src: ['*.scss'],
                    dest: '<%= yeoman.app %>/styles',
                    ext: '.css'
                }]
            },
            dist: {
                options: {
                    style: 'compressed',
                    sourcemap: 'none'
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/styles',
                    src: ['*.scss'],
                    dest: '.tmp/styles',
                    ext: '.css'
                }]
            }
        },

        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    '<%= yeoman.dist %>/scripts/{,*/}*.js',
                    '<%= yeoman.dist %>/styles/{,*/}*.css',
                    //'<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                    //'<%= yeoman.dist %>/fonts/*'
                ]
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: '<%= yeoman.app %>/index.html',
            options: {
                dest: '<%= yeoman.dist %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        // Performs rewrites based on filerev and the useminPrepare configuration
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            options: {
                assetsDirs: ['<%= yeoman.dist %>', '<%= yeoman.dist %>/images']
            }
        },

        // The following *-min tasks will produce minified files in the dist folder
        // By default, your `index.html`'s <!-- Usemin block --> will take care of
        // minification. These next options are pre-configured if you do not wish
        // to use the Usemin blocks.
        // cssmin: {
        //   dist: {
        //     files: {
        //       '<%= yeoman.dist %>/styles/main.css': [
        //         '.tmp/styles/{,*/}*.css'
        //       ]
        //     }
        //   }
        // },
        // uglify: {
        //   dist: {
        //     files: {
        //       '<%= yeoman.dist %>/scripts/scripts.js': [
        //         '<%= yeoman.dist %>/scripts/scripts.js'
        //       ]
        //     }
        //   }
        // },
        // concat: {
        //   dist: {}
        // },

        imagemin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>/images',
                        src: '{,*/}*.{png,jpg,jpeg,gif}',
                        dest: '<%= yeoman.dist %>/images'
                    }
                ]
            }
        },

        svgmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>/images',
                        src: '{,*/}*.svg',
                        dest: '<%= yeoman.dist %>/images'
                    }
                ]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: true
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['*.html', 'views/{,*/}*.html'],
                        dest: '<%= yeoman.dist %>'
                    }
                ]
            }
        },

        // ngmin tries to make the code safe for minification automatically by
        // using the Angular long form for dependency injection. It doesn't work on
        // things like resolve or inject so those have to be done manually.
        ngmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '.tmp/concat/scripts',
                        src: '*.js',
                        dest: '.tmp/concat/scripts'
                    }
                ]
            }
        },

        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            registryApp: {
                files: [
                    {
                        expand: true,
                        cwd: '.tmp/concat/scripts',
                        src: '*.js',
                        dest: '.tmp/concat/scripts'
                    }
                ]
            }
        },

        // Replace Google CDN references
        cdnify: {
            dist: {
                html: ['<%= yeoman.dist %>/*.html']
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= yeoman.app %>',
                        dest: '<%= yeoman.dist %>',
                        src: [
                            '*.{ico,png,txt}',
                            '.htaccess',
                            '*.html',
                            //'views/{,*/}*.html',
                            '!**/views/**',
                            'images/{,*/}*.{png,jpg,jpeg,gif,webp,svg,ico}',
                            'fonts/*',
//                            'bower_components/*'
                            'bower_components/es5-shim/es5-shim.js',
                            'bower_components/json3/lib/json3.min.js',
                            'bower_components/zeroclipboard/dist/ZeroClipboard.swf',
                            'data/*',
                            'vendor/jsandbox/src/jsandbox-worker.js',
                            'vendor/raphael/*'
                        ]
                    },
                    {
                        expand: true,
                        cwd: '.tmp/images',
                        dest: '<%= yeoman.dist %>/images',
                        src: ['generated/*']
                    }
                ]
            },
//            styles: {
//                expand: true,
//                cwd: '<%= yeoman.app %>/styles',
//                dest: '.tmp/styles/',
//                src: '{,*/}*.css'
//            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'sass:server'
            ],
            test: [
                'sass'
            ],
            dist: [
                'sass:dist',
                'imagemin',
                'svgmin'
            ]
        },

        // Test settings
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        },

        ngtemplates: {
            app: {
                cwd: '<%= yeoman.app %>',
                src: [
                    'views/{,*/}*.html',
                    'views/cliche/{,*/}*.html',
                    'views/app/{,*/}*.html',
                    'views/repo/{,*/}*.html',
                    'views/task/{,*/}*.html'
                ],
                dest: '<%= yeoman.app %>/scripts/template.js',
                options: {
                    module: 'registryApp',
                    htmlmin: {
                        collapseWhitespace: true,
                        collapseBooleanAttributes: true
                    }
                }
            },

            integrate: {
                cwd: '<%= yeoman.app %>',
                src: [
                    'views/{,*/}*.html',
                    'views/cliche/{,*/}*.html',
                    'views/app/{,*/}*.html',
                    'views/repo/{,*/}*.html',
                    'views/task/{,*/}*.html'
                ],
                dest: '<%= yeoman.app %>/rabixApp/scripts/template.js',
                options: {
                    module: 'rabixApp',
                    htmlmin: {
                        collapseWhitespace: true,
                        collapseBooleanAttributes: true
                    }
                }
            }
        }


    });


    grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            //'wiredep',
            'concurrent:server',
            'autoprefixer',
//            'configureProxies:livereload',
//            'connect:livereload',
            'ngtemplates:app',
            'watch'
        ]);
    });

    grunt.registerTask('integrate', 'Compiles editors as separate apps', function (target) {
        if (target === 'dyole') {
            grunt.log.write('dyole coming soon');
            return;
        }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'autoprefixer',
            'ngtemplates:integrate',
            'watch'
        ]);
    });

    grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('test', [
        'clean:server',
        //'concurrent:test',
        'autoprefixer',
        'connect:test',
        'karma'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        //'wiredep',
        'useminPrepare',
        'concurrent:dist',
        'ngtemplates:app',
        'autoprefixer',
        'concat',
        'ngAnnotate',
        'copy:dist',
        'cdnify',
        'cssmin',
        'uglify',
        'filerev',
        'usemin',
        'htmlmin'
    ]);

    grunt.registerTask('default', [
//        'newer:jshint',
//        'test',
        'build'
    ]);
};
