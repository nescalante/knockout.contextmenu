'use strict';

module.exports = function (grunt) {
    var banner = '/* <%= pkg.name %> v<%= pkg.version %>' +
            '\n   <%= pkg.author.name %> - <%= pkg.author.email %>' +
            '\n   Issues: <%= pkg.bugs.url %>' +
            '\n   License: <%= pkg.license %> */\n\n',
        pkg = grunt.file.readJSON('package.json'),
        pkgVersion = pkg.version.split('.'),
        version = grunt.option('version') || [pkgVersion[0], pkgVersion[1], parseInt(pkgVersion[2]) + 1].join('.');

    grunt.initConfig({
        pkg: pkg,
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
            src: {
                files: {
                    'dist/js/<%= pkg.name %>.min.js': ['<%= pkg.main %>']
                }
            }
        },
        less: {
            src: {
                files: {
                    'dist/css/<%= pkg.name %>.css': 'src/<%= pkg.name %>.less'
                }
            }
        },
        cssmin: {
            src: {
                files: {
                    'dist/css/<%= pkg.name %>.min.css': 'dist/css/<%= pkg.name %>.css'
                }
            }
        },
        clean: {
            dist: ['dist'],
            '.grunt': ['.grunt']
        },
        copy: {
            src: {
                src: '<%= pkg.main %>',
                dest: 'dist/js/<%= pkg.name %>.js'
            },
            less: {
                src: 'src/<%= pkg.name %>.less',
                dest: 'dist/less/<%= pkg.name %>.less'
            },
            knockout: {
                src: 'node_modules/knockout/build/output/knockout-latest.debug.js',
                dest: 'example/knockout.js'
            }

        },
        concat: {
            options: {
                stripBanners: true,
                banner: banner
            },
            js: {
                src: ['dist/js/<%= pkg.name %>.js'],
                dest: 'dist/js/<%= pkg.name %>.js',
            },
            jsmin: {
                src: ['dist/js/<%= pkg.name %>.min.js'],
                dest: 'dist/js/<%= pkg.name %>.min.js',
            },
            less: {
                src: ['dist/less/<%= pkg.name %>.less'],
                dest: 'dist/less/<%= pkg.name %>.less',
            },
            css: {
                src: ['dist/css/<%= pkg.name %>.css'],
                dest: 'dist/css/<%= pkg.name %>.css',
            },
            cssmin: {
                src: ['dist/css/<%= pkg.name %>.min.css'],
                dest: 'dist/css/<%= pkg.name %>.min.css',
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
        },
        shell: {
            release: {
                command: [
                    'git commit -am "release version ' + version + '"',
                    'git tag ' + version,
                    'git push',
                    'git push --tags',
                    'npm publish'
                ].join('&&')
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('render', 'Render an image of the context menu.', function () {
        var done = this.async();
        var render = require('./render');

        render(done);
    });

    grunt.registerTask('add-version', 'Creates a new version', function () {
        var bowerPkg = grunt.file.readJSON('bower.json');

        pkg.version = version;
        bowerPkg.version = version;

        grunt.file.write('package.json', JSON.stringify(pkg, null, 2));
        grunt.file.write('bower.json', JSON.stringify(bowerPkg, null, 2));

        grunt.log.writeln('Deploying version ' + version);
    });

    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('test', ['jasmine']);
    grunt.registerTask('default', ['lint', 'test']);
    grunt.registerTask('build', ['lint', 'test', 'clean', 'copy', 'uglify', 'less', 'cssmin', 'concat']);
    grunt.registerTask('deploy', ['add-version', 'build', 'render', 'shell:release']);
};
