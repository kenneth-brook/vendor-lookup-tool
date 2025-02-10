// Haversine formula to calculate the distance between two coordinates
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  // Load JSON data
  async function loadData() {
    const [vendorsResponse, zipResponse] = await Promise.all([
      fetch('./json/vendor.json'),
      fetch('./json/zip.json')
    ]);
  
    const vendors = await vendorsResponse.json();
    const zipData = await zipResponse.json();
  
    return { vendors, zipData };
  }
  
  // Handle form submission
  document.getElementById('location-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const zipInput = document.getElementById('zipcode').value.trim();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'Loading...';
  
    const { vendors, zipData } = await loadData();
  
    // Find user location by zip code
    const userLocation = zipData.find(z => z.zip_code.toString() === zipInput);
  
    if (!userLocation) {
      resultsDiv.textContent = "Invalid or unsupported zip code.";
      return;
    }
  
    // Calculate distances from user's location to each vendor
    const nearbyVendors = vendors.map(vendor => {
      const distance = haversine(
        userLocation.latitude,
        userLocation.longitude,
        vendor.Latitude,
        vendor.Longitude
      );
      return { ...vendor, distance };
    }).sort((a, b) => a.distance - b.distance); // Sort by distance
  
    // Display results
    resultsDiv.innerHTML = '';
    if (nearbyVendors.length === 0) {
      resultsDiv.textContent = "No vendors found.";
    } else {
      nearbyVendors.forEach(vendor => {
        const div = document.createElement('div');
        div.innerHTML = `
          <strong>${vendor.Customer}</strong><br>
          ${vendor.Address}<br>
          Phone: ${vendor.Phone}<br>
          Website: <a href="http://${vendor.Website}" target="_blank">${vendor.Website}</a><br>
          Distance: ${vendor.distance.toFixed(2)} km
          <hr>
        `;
        resultsDiv.appendChild(div);
      });
    }
  });
  