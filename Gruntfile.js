'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                reporter: require('jshint-stylish'),
                jshintrc: true
            },
            src: ['<%= pkg.main %>'],
            test: ['test/*.js'],
            grunt: ['Gruntfile.js']
        },
        uglify: {
            options: {
                banner: '// <%= pkg.name %> v<%= pkg.version %>' +
                    '\n// <%= pkg.author.name %> - <%= pkg.author.email %>' +
                    '\n// License: <%= pkg.license %>\n\n'
            },
            src: {
                files: {
                    'dist/js/<%= pkg.name %>.min.js': ['<%= pkg.main %>']
                }
            }
        },
        less: {
            src: {
                files: {
                    'dist/css/contextmenu.css': 'src/contextmenu.less'
                }
            }
        },
        cssmin: {
            src: {
                files: {
                    'dist/css/contextmenu.min.css': 'dist/css/contextmenu.css'
                }
            }
        },
        clean: {
            dist: ['dist']
        },
        copy: {
            src: {
                src: '<%= pkg.main %>',
                dest: 'dist/js/<%= pkg.name %>.js'
            },
            less: {
                src: 'src/contextmenu.less',
                dest: 'dist/less/contextmenu.less'
            }
        },
        jasmine: {
            test: {
                src: '<%= pkg.main %>',
                options: {
                    vendor: [
                        'node_modules/knockout/build/output/knockout-latest.debug.js'
                    ],
                    specs: 'test/*.js'
                }
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('render', 'Render an image of the context menu.', function () {
        var done = this.async();
        var render = require('./render');

        render(done);
    });

    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('test', ['jasmine']);
    grunt.registerTask('default', ['lint', 'test']);
    grunt.registerTask('build', ['lint', 'test', 'clean', 'copy', 'uglify', 'less', 'cssmin']);

};