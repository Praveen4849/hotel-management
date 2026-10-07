const fs = require('fs');
const path = require('path');

const runTests = async () => {
  console.log('====================================================');
  console.log('🚀 Running Complete Hotel Management Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Test Health Check
    const healthRes = await fetch('http://localhost:5000/api/health');
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'API Health Check returns 200 OK');

    // 2. Test Create Hotel with Image Upload
    const imagePath1 = path.join(__dirname, 'test-assets', 'hotel1.png');
    const imageBuffer1 = fs.readFileSync(imagePath1);
    const blob1 = new Blob([imageBuffer1], { type: 'image/png' });

    const form1 = new FormData();
    form1.append('title', 'Taj Lakeview Palace');
    form1.append('description', 'Spectacular luxury heritage hotel overlooking the serene lake waters.');
    form1.append('latitude', '24.5764');
    form1.append('longitude', '73.6800');
    form1.append('price', '8500');
    form1.append('image', blob1, 'taj-lakeview.png');

    const createRes1 = await fetch('http://localhost:5000/api/hotels', {
      method: 'POST',
      body: form1,
    });
    const createData1 = await createRes1.json();
    assert(createRes1.status === 201 && createData1.hotel?.id, 'Create Hotel 1 (Taj Lakeview Palace) returned 201');
    const hotel1Id = createData1.hotel.id;
    const hotel1ImagePath = path.join(__dirname, 'hotel-management', 'backend', createData1.hotel.image);
    assert(fs.existsSync(hotel1ImagePath), 'Hotel 1 image saved to local uploads folder on server');

    // 3. Test Create Hotel 2
    const imagePath2 = path.join(__dirname, 'test-assets', 'hotel2.png');
    const imageBuffer2 = fs.readFileSync(imagePath2);
    const blob2 = new Blob([imageBuffer2], { type: 'image/png' });

    const form2 = new FormData();
    form2.append('title', 'Himalayan Pine Retreat');
    form2.append('description', 'Tranquil mountain resort in Manali with pine forests and fresh mountain air.');
    form2.append('latitude', '32.2432');
    form2.append('longitude', '77.1892');
    form2.append('price', '2400');
    form2.append('image', blob2, 'himalayan-pine.png');

    const createRes2 = await fetch('http://localhost:5000/api/hotels', {
      method: 'POST',
      body: form2,
    });
    const createData2 = await createRes2.json();
    assert(createRes2.status === 201, 'Create Hotel 2 (Himalayan Pine Retreat) returned 201');
    const hotel2Id = createData2.hotel.id;

    // 4. Test Create Hotel 3
    const imagePath3 = path.join(__dirname, 'test-assets', 'hotel3.png');
    const imageBuffer3 = fs.readFileSync(imagePath3);
    const blob3 = new Blob([imageBuffer3], { type: 'image/png' });

    const form3 = new FormData();
    form3.append('title', 'Goa Sunset Palms Resort');
    form3.append('description', 'Beachside tropical resort with direct private beach access and pool.');
    form3.append('latitude', '15.2993');
    form3.append('longitude', '74.1240');
    form3.append('price', '4200');
    form3.append('image', blob3, 'goa-sunset.png');

    const createRes3 = await fetch('http://localhost:5000/api/hotels', {
      method: 'POST',
      body: form3,
    });
    const createData3 = await createRes3.json();
    assert(createRes3.status === 201, 'Create Hotel 3 (Goa Sunset Palms Resort) returned 201');
    const hotel3Id = createData3.hotel.id;

    // 5. Test Get Hotels (List)
    const listRes = await fetch('http://localhost:5000/api/hotels');
    const listData = await listRes.json();
    assert(listRes.status === 200 && Array.isArray(listData.hotels) && listData.total >= 3, 'GET /api/hotels returns total count and hotel array');

    // 6. Test Search by Title
    const searchRes = await fetch('http://localhost:5000/api/hotels?title=Himalayan');
    const searchData = await searchRes.json();
    assert(
      searchRes.status === 200 &&
      searchData.hotels.length >= 1 &&
      searchData.hotels.every(h => h.title.includes('Himalayan')),
      'Search by title ("Himalayan") returns matching hotel(s)'
    );

    // 7. Test Price Filter (minPrice & maxPrice)
    const filterRes = await fetch('http://localhost:5000/api/hotels?minPrice=2000&maxPrice=5000');
    const filterData = await filterRes.json();
    const allInRange = filterData.hotels.every(h => parseFloat(h.price) >= 2000 && parseFloat(h.price) <= 5000);
    assert(
      filterRes.status === 200 &&
      filterData.hotels.length >= 2 &&
      allInRange,
      'Price filter (2000-5000) correctly filters hotels by price'
    );

    // 8. Test Search + Price Filter Together
    const comboRes = await fetch('http://localhost:5000/api/hotels?title=Goa&minPrice=3000&maxPrice=5000');
    const comboData = await comboRes.json();
    assert(
      comboRes.status === 200 &&
      comboData.hotels.length >= 1 &&
      comboData.hotels.every(h => h.title.includes('Goa') && parseFloat(h.price) >= 3000 && parseFloat(h.price) <= 5000),
      'Search ("Goa") + Price filter (3000-5000) works seamlessly together'
    );

    // 9. Test Get Single Hotel by ID
    const singleRes = await fetch(`http://localhost:5000/api/hotels/${hotel1Id}`);
    const singleData = await singleRes.json();
    assert(
      singleRes.status === 200 &&
      singleData.title === 'Taj Lakeview Palace' &&
      parseFloat(singleData.latitude) === 24.5764,
      `GET /api/hotels/${hotel1Id} returns complete hotel details with coordinates`
    );

    // 10. Test Update Hotel (PUT /api/hotels/:id)
    const updateForm = new FormData();
    updateForm.append('title', 'Taj Lakeview Grand Palace (Updated)');
    updateForm.append('description', 'Updated description with new presidential suites and rooftop infinity pool.');
    updateForm.append('latitude', '24.5764');
    updateForm.append('longitude', '73.6800');
    updateForm.append('price', '9200');

    const updateRes = await fetch(`http://localhost:5000/api/hotels/${hotel1Id}`, {
      method: 'PUT',
      body: updateForm,
    });
    const updateData = await updateRes.json();
    assert(
      updateRes.status === 200 &&
      updateData.hotel.title === 'Taj Lakeview Grand Palace (Updated)' &&
      parseFloat(updateData.hotel.price) === 9200,
      'Update Hotel (PUT /api/hotels/:id) updates title and price successfully'
    );

    // 11. Test Form Validation: Missing title
    const invalidForm1 = new FormData();
    invalidForm1.append('title', '');
    invalidForm1.append('description', 'Valid description');
    invalidForm1.append('latitude', '20');
    invalidForm1.append('longitude', '70');
    invalidForm1.append('price', '1000');
    invalidForm1.append('image', blob1, 'test.png');

    const invalidRes1 = await fetch('http://localhost:5000/api/hotels', {
      method: 'POST',
      body: invalidForm1,
    });
    assert(invalidRes1.status === 400, 'Validation: Empty title rejected with 400 Bad Request');

    // 12. Test Form Validation: Invalid Price (negative/zero)
    const invalidForm2 = new FormData();
    invalidForm2.append('title', 'Invalid Hotel');
    invalidForm2.append('description', 'Valid description');
    invalidForm2.append('latitude', '20');
    invalidForm2.append('longitude', '70');
    invalidForm2.append('price', '-500');
    invalidForm2.append('image', blob1, 'test.png');

    const invalidRes2 = await fetch('http://localhost:5000/api/hotels', {
      method: 'POST',
      body: invalidForm2,
    });
    assert(invalidRes2.status === 400, 'Validation: Negative price rejected with 400 Bad Request');

    // 13. Test Form Validation: Invalid Latitude (>90)
    const invalidForm3 = new FormData();
    invalidForm3.append('title', 'Invalid Hotel');
    invalidForm3.append('description', 'Valid description');
    invalidForm3.append('latitude', '95.5');
    invalidForm3.append('longitude', '70');
    invalidForm3.append('price', '2000');
    invalidForm3.append('image', blob1, 'test.png');

    const invalidRes3 = await fetch('http://localhost:5000/api/hotels', {
      method: 'POST',
      body: invalidForm3,
    });
    assert(invalidRes3.status === 400, 'Validation: Out of bounds latitude rejected with 400 Bad Request');

    // 14. Test Delete Hotel and Image File Removal
    const deleteRes = await fetch(`http://localhost:5000/api/hotels/${hotel2Id}`, {
      method: 'DELETE',
    });
    const deleteData = await deleteRes.json();
    assert(
      deleteRes.status === 200 &&
      deleteData.message === 'Hotel deleted successfully',
      'Delete Hotel (DELETE /api/hotels/:id) returns 200 and success message'
    );

    const checkDeletedRes = await fetch(`http://localhost:5000/api/hotels/${hotel2Id}`);
    assert(checkDeletedRes.status === 404, 'Verified deleted hotel is no longer retrievable (404 Not Found)');

    // 15. Test Static Uploaded Image Serving
    const staticImageRes = await fetch(`http://localhost:5000/${createData3.hotel.image}`);
    assert(staticImageRes.status === 200, 'Static image successfully served at /uploads URL');

    // 16. Test Frontend Server (Vite)
    const frontendRes = await fetch('http://localhost:3000/');
    const frontendHtml = await frontendRes.text();
    assert(
      frontendRes.status === 200 &&
      frontendHtml.includes('Hotel Management') &&
      frontendHtml.includes('leaflet'),
      'Frontend Vite server is serving the Single Page Application'
    );

    console.log('\n====================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unexpected error in test execution:', err);
    process.exit(1);
  }
};

runTests();
