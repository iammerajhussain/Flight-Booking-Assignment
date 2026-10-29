Feature: Search flights based on flight routes

  Background:
    Given the user opens the Booking.com flights page

  Scenario Outline: TC03 Search DEL to BOM for a selected travel date
    When the user searches from DEL to BOM for <day>
    Then the flight results should reflect the selected route and date

    Examples:
      | day      |
      | today    |
      | tomorrow |

  Scenario: TC04 Past dates cannot be selected
    When the user opens the travel date picker
    Then yesterday should be disabled in the calendar

  Scenario: TC06 Prevent search when destination is empty
    When the user clicks Explore
    Then the search should be blocked or show validation

  Scenario: TC07 Prevent search when origin and destination are the same
    Given the user selects DEL as the departure airport
    And the user selects DEL as the destination airport
    When the user clicks Explore
    Then the search should be blocked or show validation

  Scenario: TC11 Airport search input treats script text as plain text
    When the user types unsafe text in the origin airport search
    Then the airport search should keep the text inert

  Scenario: TC12 Swap origin and destination values
    Given the user selects DEL as the departure airport
    And the user selects BOM as the destination airport
    When the user swaps the route
    Then the origin and destination values should be exchanged