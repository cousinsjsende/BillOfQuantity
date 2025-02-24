import React from 'react';

const More = () => {

    const suppliers = [
        { name: 'Builders Hub', url: 'buildershubhardware.co.zw' },
        { name: 'Electrosales', url: 'www.electrosales.co.zw' },
        { name: 'Zim Steel', url: 'zimsteel.co.zw' },
        { name: 'Union Hardware', url: 'unionhardware.co.zw' },
        { name: 'Zimbabwe Building Materials Suppliers', url: 'www.zbms.co.zw' },
        { name: 'Halsted Builders Express', url: 'halsteds.co.zw' },
        { name: 'Everything Zimbabwean', url: 'everythingzimbabwean.com' },
        { name: 'Ace Industrial', url: 'acehardware.co.zw' },
        { name: 'Zimbuild Group', url: 'zimbuildgroup.co.zw' },
        { name: 'PG Industries', url: 'pg.pgiz.co.zw' },
        { name: 'N Richards Group', url: 'nrichards.co.zw' },
        { name: 'Zimyellow', url: 'www.zimyellow.com' },
        { name: 'Affriggon Construction', url: 'thedirectory.co.zw/company.cfm?companyid=3377&searchfield=Hardware' },
        { name: 'Alquip Hardware', url: 'thedirectory.co.zw/company.cfm?companyid=4530&searchfield=Hardware' },
        { name: 'Go 4World Business', url: 'www.go4worldbusiness.com/suppliers/zimbabwe/products/builders-hardware-construction-material-equipment.html' },
        { name: 'Statista', url: 'www.statista.com' },
        { name: 'The Gap', url: 'www.thegapcompany.co.zw/supply.php' },
        { name: 'Makanaka Investiments', url: 'makanakainvestments.com/hardware' },
        { name: 'Fastbase', url: 'www.fastbase.com/countryindex/Zimbabwe/B/Building-materials-supplier' },
    ];

    return (
        <div className="grid mb-4 pb-10 px-8 mx-4 rounded-3xl bg-gray-100 border-4 border-blue-600">
            <h2 className="mr-60 ml-60 text-2xl font-bold text-center leading-10 tracking-widest text-gray-700 pb-4 pt-6">
                Suppliers
            </h2>
            <p className="mb-4 leading-relaxed mx-20 tracking-wider">
                Here are some of the suppliers for building materials:
            </p>
            <div className="mx-20 grid gap-4">
                {suppliers.map((supplier, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                        <p className="text-lg font-semibold tracking-wider text-gray-700">
                            {supplier.name}
                        </p>
                        <a
                            href={`https://${supplier.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline text-sm mt-1"
                        >
                            Visit website 
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default More;
