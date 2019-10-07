# oem-demo
Demo site for the oem framework https://github.com/kvnlnt/oem

# Setup

Install demo dependencies:

    npm i

Install oem:

    git submodule init
    git submodule update
    cd oem
    npm i

# Run

To launch the demo run `node demo [demo]`. The `demo` argument is any of the filenames of the html documents in `src`. In order to run the weather.html demo, you'd run this command:

    node demo weather

