import java.net.URL;
import java.io.InputStream;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
public class TestAI {
  public static void main(String[] args) throws Exception {
    try {
      System.out.println("Starting PDFBox check...");
      PDFTextStripper stripper = new PDFTextStripper();
      System.out.println("Stripper loaded successfully.");
    } catch(Exception e) {
      e.printStackTrace();
    }
  }
}
