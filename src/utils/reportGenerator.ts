
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Extend the jsPDF types to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Types for our report data
type ReportDataPoint = {
  timestamp: string;
  attention: number;
  understanding: number;
  transcript: string;
};

type LessonSegment = {
  timestamp: string;
  topic: string;
  status: string;
  transcript: string;
};

export const generateAndDownloadReport = (
  reportData: ReportDataPoint[],
  lessonOutline: LessonSegment[],
  title = "Lesson Summary"
) => {
  // Create a new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(89, 65, 169); // Purple color
  doc.text(title, 14, 22);

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 30);
  
  // Add summary section
  doc.setFontSize(16);
  doc.setTextColor(60, 60, 60);
  doc.text("Overview", 14, 40);
  
  // Calculate understanding percentage from data
  const totalSegments = lessonOutline.length;
  const attentiveSegments = lessonOutline.filter(segment => segment.status === 'attentive').length;
  const understandingPercentage = Math.round((attentiveSegments / totalSegments) * 100);
  
  doc.setFontSize(12);
  doc.text(`Overall understanding: ${understandingPercentage}%`, 14, 50);
  
  // Add transcript section
  doc.setFontSize(16);
  doc.text("Lesson Transcript Highlights", 14, 65);
  
  // Add transcript content
  doc.setFontSize(10);
  let yPos = 75;
  reportData.forEach(item => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(item.transcript, 14, yPos);
    yPos += 10;
  });
  
  // Add a new page for the lesson outline
  doc.addPage();
  
  // Add lesson outline section
  doc.setFontSize(16);
  doc.setTextColor(60, 60, 60);
  doc.text("Lesson Outline", 14, 20);
  
  // Set up the table for lesson outline
  const outlineTableData = lessonOutline.map(item => [
    item.topic, 
    item.status.charAt(0).toUpperCase() + item.status.slice(1),
    item.transcript.length > 60 ? item.transcript.substring(0, 60) + "..." : item.transcript
  ]);
  
  doc.autoTable({
    startY: 30,
    head: [['Topic', 'Status', 'Content']],
    body: outlineTableData,
    theme: 'grid',
    headStyles: { fillColor: [89, 65, 169] },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 30 },
      2: { cellWidth: 'auto' }
    }
  });
  
  // Add recommendations based on data
  const lowUnderstandingSegments = lessonOutline.filter(segment => segment.status === 'confused');
  
  if (lowUnderstandingSegments.length > 0) {
    yPos = doc.autoTable.previous.finalY + 20;
    
    doc.setFontSize(16);
    doc.text("Areas That Need Review", 14, yPos);
    
    yPos += 10;
    doc.setFontSize(12);
    
    lowUnderstandingSegments.forEach((segment, index) => {
      doc.text(`${index + 1}. ${segment.topic}`, 14, yPos);
      yPos += 8;
    });
  }
  
  // Save the PDF
  doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
};
