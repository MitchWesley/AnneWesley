export function generateQRCodeURL(text: string, size = 200): string {
  // Using QR Server API for generating QR codes
  const baseURL = "https://api.qrserver.com/v1/create-qr-code/"
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: text,
    format: "png",
    bgcolor: "ffffff",
    color: "22c55e", // Green color to match theme
    margin: "10",
    qzone: "2",
  })

  return `${baseURL}?${params.toString()}`
}
