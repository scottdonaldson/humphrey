module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            ignore_warning: {
                options: {
                    '-W083': true
                }
            },
            options: {
                force: true
            },
            all: ['Gruntfile.js', 'js/src/**/*.js']
        },

        uglify: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'js/src',
                    ext: '.min.js',
                    src: '**/*.js',
                    dest: 'js/min'                   
                }]
            }
        },

        sass: {
            dist: {
                options: {
                    compass: true,
                    style: 'compressed'
                },
                files: {
                    'css/foundation.css': 'scss/foundation.scss'
                }
            }
        },

        autoprefixer: {
            options: {
                browsers: ['> 1%']
            },
            no_dest: {
                src: ['css/foundation.css']
            }
        },

        watch: {
            options: {
                livereload: true
            },
            scripts: {
                files: ['js/**/*.js'],
                tasks: ['uglify', 'jshint'],
                options: {
                    spawn: false,
                }
            },
            css: {
                files: ['sass/*.scss', 'css/foundation.css'],
                tasks: ['sass', 'autoprefixer'],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint', 'uglify', 'sass', 'autoprefixer', 'watch']);

};