Upon clicking the “New Unit“ from listing screen, users will be directed to the new unit creation form. Within this section, the following fields exist:

Unit Name: Alphanumeric input field with a character limit of 100 (Mandatory).

Empty State of Input Field: Enter Unit Name.

Unit Symbol: Must be a unique symbol. Alphanumeric input field with character limit 15 (Mandatory).

Empty State of Input Field: Enter Unit Symbol.

Description: Alphanumeric input field with a character limit 500 (Optional).

Empty State of Input Field: Enter Description.

Unit Category: Single Select Drop-down (Mandatory), enabling users to easily select and categorise the unit being created. These categories will be predefined in the system such as Length, Area, Weight, Volume & Quantity. 

After users have defined the conversion factors in the creation form and update the category type, system would undo the conversion table for the users to define it again.

 

image-20240819-105600.png
 

The category selected in “Basic Info“, would impact the “Same Category Conversion Table” Section.

Same Category Conversion section would display the name of the category as tags.

“Convert To Unit Dropdown” would include units of the selected category.

Category Name would be displayed on the header of Conversion Table

Empty State of Input Field: Select Unit Category.

Acceptance Criteria
Upon clicking “New Unit”, users should be directed to the unit creation form that includes the Basic Info section consisting the aforementioned fields.

User should be able to fill in both the Mandatory and Optional fields. 

Predefined unit category dropdown must include Length, Area, Weight, Volume & Quantity. 

The system should validate the input to ensure that mandatory fields are filled, and the input adheres to the specified character limits.

Error messages would be displayed in case mandatory fields are not filled or character limit is exceeding.

After users have defined the conversion factors in the creation form and update the category type, system would undo the conversion table for the users to define it again.

Business Rules
One unit of measure cannot exist in multiple unit categories.

The standard units of measure that fall into categories like Length, Area, Weight, Volume & Quantity should all be predefined in the system. 

Alternative Scenarios
Validation for Unique Unit Names: The system checks if the unit name and symbol entered by the user is unique and does not already exist in the system. If a duplicate name is detected, the user is prompted with “Unit Already Exists, Enter a Different Name“ or “Unit Already Exists, Enter a Different Unit“.

Character Limit Warning: If the user exceeds the character limit, the system displays a warning message indicating “Character Limit Exceeded“ and restricts the user to input any further character.

Mandatory Field Check: If the mandatory fields are not filled, the system should prompt an error message. 

Unit Name: Error Message “Unit Name is Required“

Unit Category: Error Message “Unit Category is Required”

Unit Symbol: Error Message “Unit Symbol is Required“

Non-functional Requirements
Performance: The system should load the unit creation form and process user inputs swiftly, ensuring minimal wait times for users.

Scalability: The system should be capable of handling a large number of concurrent users creating units simultaneously without experiencing performance degradation