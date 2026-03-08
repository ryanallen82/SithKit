"""Entry point for python -m sithkit."""

import webbrowser

import uvicorn


def main():
    print("SithKit - Hardware Hacking Toolkit")
    print("Starting server at http://127.0.0.1:8000\n")
    webbrowser.open("http://127.0.0.1:8000")
    uvicorn.run("sithkit.app:app", host="127.0.0.1", port=8000)


if __name__ == "__main__":
    main()
