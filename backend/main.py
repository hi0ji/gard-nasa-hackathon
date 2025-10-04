from flask import Flask, render_template
app = Flask(__name__) 
# Routes
@app.route("/")
def main():
    return "Hello Main"

@app.route("/test")
def test():
    return "Flask is working!"

# Main
if __name__ == "__main__":
    app.run(debug=True, use_reloader=True)