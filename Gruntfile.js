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
                    'dist/<%= pkg.name %>.min.js': ['<%= pkg.main %>']
                }
            }
        },
        copy: {
            src: {
                src: '<%= pkg.main %>',
                dest: 'dist/<%= pkg.name %>.js'
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

    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('test', ['jasmine']);
    grunt.registerTask('default', ['lint', 'test']);
    grunt.registerTask('build', ['lint', 'test', 'copy', 'uglify']);
};