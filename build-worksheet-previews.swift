// build-worksheet-previews.swift — renders every page of the worksheet PDFs to a
// JPEG preview for worksheets.html. Re-run whenever a PDF changes:
//   swift build-worksheet-previews.swift
// Output: images/worksheets/<prefix>-NN.jpg (generated — never hand-edit).
import Foundation
import PDFKit
import AppKit

let jobs: [(pdf: String, prefix: String)] = [
  ("Punctuators-Worksheets-PRINT.pdf", "worksheet"),
  ("Punctuators-Answer-Key-PRINT.pdf", "answer-key"),
]
let outDir = "images/worksheets"
let targetWidth: CGFloat = 900   // px; sharp enough for the enlarge view, small on disk

try? FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)

for job in jobs {
  guard let doc = PDFDocument(url: URL(fileURLWithPath: job.pdf)) else {
    print("!! could not open \(job.pdf)"); exit(1)
  }
  for i in 0..<doc.pageCount {
    guard let page = doc.page(at: i) else { continue }
    let box = page.bounds(for: .cropBox)
    let scale = targetWidth / box.width
    let w = Int(box.width * scale), h = Int(box.height * scale)
    guard let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h,
                                     bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true,
                                     isPlanar: false, colorSpaceName: .deviceRGB,
                                     bytesPerRow: 0, bitsPerPixel: 0),
          let ctx = NSGraphicsContext(bitmapImageRep: rep) else { continue }
    let cg = ctx.cgContext
    cg.setFillColor(NSColor.white.cgColor)
    cg.fill(CGRect(x: 0, y: 0, width: w, height: h))
    cg.scaleBy(x: scale, y: scale)
    cg.translateBy(x: -box.origin.x, y: -box.origin.y)
    page.draw(with: .cropBox, to: cg)
    let name = String(format: "%@/%@-%02d.jpg", outDir, job.prefix, i + 1)
    let data = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.72])!
    try! data.write(to: URL(fileURLWithPath: name))
    print("wrote \(name) (\(w)x\(h), \(data.count / 1024) KB)")
  }
}
