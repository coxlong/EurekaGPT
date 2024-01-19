declare global {
  /*eslint no-var: "off"*/
  var snackbar: {
    error: (text: string) => void
    success: (text: string) => void
  }
}

export {}
