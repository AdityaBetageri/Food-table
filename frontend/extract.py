import os
from pypdf import PdfReader

def extract_text(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def process_pdf(filename, title, out_path):
    pdf_path = os.path.join("public", "pdfs", filename + ".pdf")
    text = extract_text(pdf_path)
    lines = text.split('\n')
    
    # Filter out page numbers, headers, "Automatic Zoom", etc.
    filtered_lines = []
    for line in lines:
        l = line.strip()
        if not l: continue
        if l == 'n' or "Automatic Zoom" in l or l.startswith("Page ") or "www.tabletap.in" in l or l.startswith("Effective Date:"):
            continue
        filtered_lines.append(l)

    paragraphs = []
    current_para = []
    
    for line in filtered_lines:
        if (line[0].isdigit() and "." in line) or (len(line) < 50 and not line.endswith('.')):
            if current_para:
                paragraphs.append(('p', " ".join(current_para)))
                current_para = []
            paragraphs.append(('h', line))
        else:
            current_para.append(line)
            
    if current_para:
        paragraphs.append(('p', " ".join(current_para)))

    jsx_content = ""
    for typ, txt in paragraphs:
        txt = txt.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('{', '&#123;').replace('}', '&#125;')
        if typ == 'h':
            jsx_content += f"        <h3 style={{{{ marginTop: '24px', marginBottom: '12px', fontSize: '1.25rem', fontWeight: 'bold', color: '#1a202c' }}}}>{txt}</h3>\n"
        else:
            jsx_content += f"        <p style={{{{ marginBottom: '16px', lineHeight: '1.7', color: '#4a5568', fontSize: '1rem' }}}}>{txt}</p>\n"

    jsx = f"""import React from 'react';

export default function {title.replace(' ', '').replace('&', 'And')}() {{
  return (
    <div style={{{{ padding: '5% 5%', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}}}>
      <div style={{{{ padding: '40px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}}}>
        <h1 style={{{{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '10px', color: '#1a202c', fontWeight: '800' }}}}>{title}</h1>
        <p style={{{{ color: '#718096', marginBottom: '40px', fontSize: '0.95rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}}}>Last updated: April 30, 2026</p>
        
        <div className="legal-content">
{jsx_content}
        </div>
      </div>
    </div>
  );
}}
"""
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(jsx)
    print(f"Generated {out_path}")

process_pdf("privacy-policy", "Privacy Policy", r"src\pages\Legal\PrivacyPolicy.jsx")
process_pdf("terms-and-conditions", "Terms & Conditions", r"src\pages\Legal\Terms.jsx")
process_pdf("cookies-policy", "Cookies Policy", r"src\pages\Legal\CookiesPolicy.jsx")
