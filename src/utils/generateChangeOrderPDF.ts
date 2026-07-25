export const generateChangeOrderPDF = async (project: any, co: any) => {
  // Dynamically import to avoid core-js/SSR issues in Next.js Turbopack
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  // Create a new PDF document (Portrait, mm, A4)
  const doc = new jsPDF('p', 'mm', 'a4');

  // Constants
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 15;
  const marginTop = 20;

  // Colors
  const primaryColor = '#0F2228';
  const secondaryColor = '#4B5563';
  const accentColor = '#10B981';

  // 1. Header Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(primaryColor);
  doc.text('CHANGE ORDER', marginLeft, marginTop);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor);
  doc.text(`Reference No: ${co.number || 'N/A'}`, marginLeft, marginTop + 8);
  doc.text(`Date: ${new Date(co.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, marginLeft, marginTop + 14);

  // Rhino Air Details (Right Aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.text('Rhino Air Partner Portal', pageWidth - 15, marginTop, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.text('1234 HVAC Lane, Suite 100', pageWidth - 15, marginTop + 6, { align: 'right' });
  doc.text('Austin, TX 78701', pageWidth - 15, marginTop + 12, { align: 'right' });
  doc.text('support@rhinoair.com', pageWidth - 15, marginTop + 18, { align: 'right' });

  // 2. Project Details
  doc.setDrawColor(200, 200, 200);
  doc.line(marginLeft, marginTop + 25, pageWidth - 15, marginTop + 25);

  const billedToY = marginTop + 35;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor);
  doc.text('PROJECT DETAILS:', marginLeft, billedToY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.text(`${project?.address || 'Unknown Address'}`, marginLeft, billedToY + 6);
  if (project?.customerName) {
    doc.text(`Customer: ${project.customerName}`, marginLeft, billedToY + 12);
  }

  // 3. Table Data
  const tableStartY = billedToY + 25;
  const tableData = [
    ['Change Order', co.number || 'N/A'],
    ['Scope', co.title || 'N/A'],
    ['Status', co.status || 'Pending'],
    ['Date', new Date(co.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })],
  ];

  autoTable(doc, {
    startY: tableStartY,
    body: tableData,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: 6,
      textColor: secondaryColor,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: primaryColor, cellWidth: 50 },
      1: { cellWidth: 'auto' },
    },
    didDrawCell: (data) => {
      // Add a bottom border to all rows except the last
      if (data.row.index < tableData.length - 1 && data.row.section === 'body') {
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.1);
        doc.line(
          data.cell.x,
          data.cell.y + data.cell.height,
          data.cell.x + data.cell.width,
          data.cell.y + data.cell.height
        );
      }
    }
  });

  // 4. Amount Total Section
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.text('TOTAL AMOUNT', marginLeft, finalY);

  const amountStr = `${co.status !== 'DECLINED' ? '+' : ''}$${parseFloat(co.amount || 0).toLocaleString()}`;
  
  doc.setFontSize(24);
  doc.text(amountStr, pageWidth - 15, finalY + 2, { align: 'right' });

  if (co.status === 'APPROVED') {
    doc.setTextColor(accentColor);
    doc.setFontSize(12);
    doc.text('APPROVED', pageWidth - 15, finalY + 10, { align: 'right' });
  } else if (co.status === 'DECLINED') {
    doc.setTextColor(220, 38, 38); // Red
    doc.setFontSize(12);
    doc.text('DECLINED', pageWidth - 15, finalY + 10, { align: 'right' });
  }

  // 5. Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(marginLeft, footerY - 5, pageWidth - 15, footerY - 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for partnering with Rhino Air.', pageWidth / 2, footerY, { align: 'center' });

  // Save the PDF
  doc.save(`Change_Order_${co.number || '01'}.pdf`);
};
