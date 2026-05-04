import PyPDF2
import sys

def read_pdf(file_path):
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page_num in range(len(reader.pages)):
                page = reader.pages[page_num]
                text += page.extract_text() + "\n"
        with open(r"c:\Users\nikhi\Downloads\TableTap\pdf_content.txt", "w", encoding="utf-8") as out_file:
            out_file.write(text)
        print("Successfully wrote to pdf_content.txt")
    except Exception as e:
        print(f"Error reading PDF: {e}", file=sys.stderr)

if __name__ == "__main__":
    read_pdf(r"C:\Users\nikhi\Downloads\TableTap_Project_Documentation.pdf")
