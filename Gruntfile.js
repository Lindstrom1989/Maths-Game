module.exports = function(grunt) {
  'use strict';
  	var jsSrcArray = ['js/*.js', '!js/scripts.js', '!js/scripts.min.js'];
	// Configure task(s)
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		// Javascript - uglify
		uglify: {
			build: { 
				src: jsSrcArray,
				dest: 'js/scripts.min.js'
			},
			dev: {
				options: {
					beautify: true,
					mangle: false,
					compress: false,
					preserveComments: 'all'
				},
				src: jsSrcArray,
				dest: 'js/scripts.js'
			}
		},
		// CSS - sass
		sass: {
			build: {
				options: {
					outputStyle: 'compressed'
				},
				files: {'css/buildStyles.css' : 'scss/style.scss'}
			},

			dev: {
				options: {
					outputStyle: 'expanded'
				},
				files: {'css/devStyles.css' : 'scss/style.scss'}
			}
		},
		// Watch
		watch: {
		  js: {
		    files: jsSrcArray,
		    tasks: ['uglify:dev']
		  },
		  css: {
		    files: ['scss/*.scss'],
		    tasks: ['sass:dev']
		  }
		}
	});

	// Load plugin(s)
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	// Register task(s)
	grunt.registerTask('default', ['uglify:dev', 'sass:dev']);
	grunt.registerTask('build', ['uglify:build', 'sass:build']);
};