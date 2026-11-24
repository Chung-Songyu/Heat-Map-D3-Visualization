////// Data visualisation using D3.js library (Heat Map)
let datasetJSON, dataset;

//// Retrieve raw data for heat map
let dataRetrieveSuccess = false;
async function getData() {
    try {
        const response = await fetch('/api/data');
        datasetJSON = await response.json();
        dataset = datasetJSON.monthlyVariance;

        // Invalid endpoint/Server error
        if (!response.ok) {
            throw new Error(datasetJSON.error);

        } else {
            console.log(datasetJSON);

            // Data retrieved successfully
            if (dataset.length) {
                dataRetrieveSuccess = true;

            // Data retrieved unsuccessfully
            } else {
                throw new Error("No data retrieved");
            }
        }

    } catch (error) {
        console.log(error);
    }
}

//// Draw heat map
getData().then(dataResponse => {
    // Data retrieved unsuccessfully
    if (!dataRetrieveSuccess) {
        document.getElementById("error").hidden = false;
        document.getElementById("error").innerText = "Error retrieving map data";
        return;
    }
    
    //// SVG
    // SVG configuration
    const padding = {
        top: 60,
        right: 150,
        bot: 100,
        left: 150
    };
    const height = 800;
    const width = 1600;

    // Set SVG configuration
    const svg = d3.select("#container")
        .append("svg")
        .attr("height", height)
        .attr("width", width);

    // Set tooltip configuration
    const tooltip = d3.select("#container")
        .append("div")
        .attr("id", "tooltip")
        .attr("class", "hidden");
    
    //// Legend
    const baseTemp = datasetJSON.baseTemperature;
    // Min and max temperature variance
    const variance = [d3.min(dataset, data => data.variance), d3.max(dataset, data => data.variance)];
    
    // Legend colour configuration
    const colors = [
        [1, "#0000ff"], // Dark blue
        [2, "#2c33ff"],
        [3, "#5866ff"],
        [4, "#8498ff"],
        [5, "#b0ccff"],
        [6, "#dcffff"],
        [7, "#ffffdc"],
        [8, "#ffd5b7"],
        [9, "#ffaa93"],
        [10, "#ff7f6e"],
        [11, "#ff5549"],
        [12, "#ff2b25"],
        [13, "#ff0000"] // Dark red
    ];
    
    // Legend configuration
    const legendPadding = {
        right: 147,
        bot: 40
    };
    const legendCellWidth = 35;
    const legendCellHeight = 20;
    
    // Set all legend color boxes
    const legend = d3.select("svg")
        .append("g")
        .attr("id", "legend")
        .selectAll("rect")
        .data(colors)
        .enter()

        // Set individual legend color box (width and height)
        .append("rect")
        .attr("width", legendCellWidth)
        .attr("height", legendCellHeight)
        
        // Set individual legend color box (placement of box on x-axis)
        .attr("x", (data, index) => width - legendPadding.right - (colors.length - index) * legendCellWidth)
        // Set individual legend color box (placement of box on y-axis)
        .attr("y", height - legendPadding.bot - legendCellHeight)
        
        // Set individual legend color box (colour)
        .style("fill", (data, index) => colors[index][1]);
    
    // Legend tickmark value configuration
    const legendDomain = [];
    for (i = 0; i <= colors.length; i++) {
        legendDomain.push(Number((baseTemp + variance[0] + i * (variance[1] - variance[0]) / colors.length).toFixed(1)));
    }
    
    // Legend tickmark positioning configuration
    const legendRange = [];
    for (i = 0; i <= colors.length; i++) {
        legendRange.push(i * legendCellWidth);
    }
    
    // Set legend tickmark configuration
    const legendXScale = d3.scaleOrdinal()
        // Temperature value of legend tickmarks
        .domain(legendDomain)
        // X-axis positioning of legend tickmarks
        .range(legendRange);

    // Define placement of legend x-axis (bottom of legend)
    const legendXAxis = d3.axisBottom(legendXScale);
    
    // Draw legend
    svg.append("g")
        // Define position of start of legend x-axis (smallest legend x-axis value)
        .attr("transform", "translate(" + (width - legendPadding.right - colors.length * legendCellWidth) + ", " + (height - legendPadding.bot) + ")")
        .attr("id", "legend-x-axis")
        .call(legendXAxis);
    
    //// X-dimension
    // Set monthly temperature cells configuration (x-dimension)
    const monthlyTempXScale = d3.scaleBand()
        // Unique year values of monthly temperature cells
        .domain([...new Set(dataset.map((data) => data.year))])
        // Min and max x-axis positioning of monthly temperature cells
        .range([padding.left, width - padding.right]);
    
    // Define placement of x-axis (bottom of SVG)
    const xAxis = d3.axisBottom(monthlyTempXScale)
        // Define x-axis tickmark values
        .tickValues([...new Set(dataset.map((data) => data.year).filter((data) => data % 10 == 0))]);
    
    // Draw x-axis
    svg.append("g")
        .attr("transform", "translate(0, " + (height - padding.bot) + ")")
        .attr("id", "x-axis")
        .call(xAxis);
    
    // X-axis label
    svg.append("text")
        .text("Year")
        .attr("id", "xAxisLabel")
        .attr("transform", "translate(" + width / 2 + ", " + (height - legendPadding.bot) + ")");
    
    //// Y-dimension
    const month = {
        "0": "January",
        "1": "February",
        "2": "March",
        "3": "April",
        "4": "May",
        "5": "June",
        "6": "July",
        "7": "August",
        "8": "September",
        "9": "October",
        "10": "November",
        "11": "December"
    };
    
    // Set monthly temperature cells configuration (y-dimension)
    const monthlyTempYScale = d3.scaleBand()
        // Month values of monthly temperature cells
        .domain(Object.values(month))
        // Min and max y-axis positioning of monthly temperature cells
        .rangeRound([padding.top, height - padding.bot]);
    
    // Define placement of y-axis (left of SVG)
    const yAxis = d3.axisLeft(monthlyTempYScale);
    
    // Draw y-axis
    svg.append("g")
        .attr("transform", "translate(" + padding.left + ", 0)")
        .attr("id", "y-axis")
        .call(yAxis);
    
    // Y-axis label
    svg.append("text")
        .text("Month")
        .attr("id", "yAxisLabel")
        .attr("transform", "translate(60, " + height / 2 + ")rotate(270)");
    
    // Determine color of monthly temperature cell
    function cellColor(variance) {
        // Monthly temperature is higher than largest legend tickmark value (legend tickmark is rounded to 1 decimal place)
        if (baseTemp + variance > legendDomain[legendDomain.length - 1]) {
            return colors[colors.length - 1][1];
        }

        for (i = 1; i < legendDomain.length; i++) {
            if (baseTemp + variance <= legendDomain[i]) {
                return colors[i - 1][1];
            }
        }
    };
    
    // Min and max year
    const yearArr = [d3.min(dataset, data => data.year), d3.max(dataset, data => data.year)];
    
    // Set all monthly temperature cells in heat map
    svg.append("g")
        .selectAll("rect")
        .data(dataset)
        .enter()
        
        // Set individual monthly temperature cell in heat map (width and height)
        .append("rect")
        .attr("width", (width - padding.left - padding.right) / (yearArr[1] - yearArr[0] + 1))
        .attr("height", (height - padding.top - padding.bot) / Object.keys(month).length)
        
        // Set individual monthly temperature cell (placement of individual cell in x-dimension)
        .attr("x", (data) => monthlyTempXScale(data.year))
        // Set individual monthly temperature cell (placement of top of individual cell in y-dimension)
        .attr("y", (data) => padding.top + (data.month - 1) * (height - padding.top - padding.bot) / Object.keys(month).length)
        
        // Set individual monthly temperature cell (colour)
        .style("fill", (data) => cellColor(data.variance))
        
        // Assign "class" attribute (value = "cell") to each individual cell
        .attr("class", "cell")
        // Assign "data-month" attribute (value = cell's month) to each individual cell
        .attr("data-month", (data) => data.month - 1)
        // Assign "data-year" attribute (value = cell's year) to each individual cell
        .attr("data-year", (data) => data.year)
        // Assign "data-temp" attribute (value = cell's variance) to each individual cell
        .attr("data-temp", (data) => data.variance)
        
        // Set individual monthly temperature cell's tooltip
        .on("mouseover", function (dataset, data) {
            // Tooltip configuration
            const tooltipOffset = {
                top: 30,
                right: 10
            };
            
            // Set position of tooltip in x- and y-dimension
            tooltip.style("top", padding.top + (data.month - 1) * (height - padding.top - padding.bot) / Object.keys(month).length - tooltipOffset.top + "px")
                .style("left", monthlyTempXScale(data.year) + tooltipOffset.right + "px")
                // Tooltip content
                .text(month[data.month - 1] + " " + data.year + ", Temp: " + (baseTemp + data.variance).toFixed(2) + "°C")
                // Assign "data-year" attribute (value = selected cell's year) to tooltip
                .attr("data-year", data.year);
            
            // Show tooltip
            d3.select("#tooltip").classed("hidden", false);
            // Apply CSS settings to highlight selected cell
            d3.select(this).classed("selected", true);
        })
        .on("mouseout", function (dataset, data) {
            // Hide tooltip
            d3.select("#tooltip").classed("hidden", true);
            // Remove CSS settings to de-emphasize selected cell
            d3.select(this).classed("selected", false);
        });
});