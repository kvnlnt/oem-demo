# oem-demo
Demo site for the oem framework https://github.com/kvnlnt/oem

# Setup

Install demo dependencies

    npm install

Install oem (it's a submodule)

    git submodule init

Install oem's dependencies

    cd oem
    npm install


# Run

To launch the demo run `node demo [demo]`. The `demo` argument is any of the filenames of the html documents in `src`. In order to run the weather.html demo, you'd run this command:

    node demo weather

