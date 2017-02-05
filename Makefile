all: clean
	mkdir build
	cp -r src/* build/
	cp -r screenshots/* build/

pack: all
	zip -r build.zip build

clean:
	rm -fr build
	rm -fr build.zip
